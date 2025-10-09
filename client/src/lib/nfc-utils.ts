// NFC utilities for reading NFC tags
// Note: Web NFC API has limited browser support and requires HTTPS

export interface NFCReadResult {
  uid: string;
  data?: string;
  type?: string;
}

export interface NFCError {
  message: string;
  code: string;
}

class NFCManager {
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'NDEFReader' in window;
  }

  /**
   * Check if NFC is supported in the current browser
   */
  isNFCSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Request NFC permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('NFC is not supported in this browser');
    }

    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'nfc' as PermissionName });
        return permission.state === 'granted' || permission.state === 'prompt';
      }
      return true;
    } catch (error) {
      console.warn('Could not check NFC permissions:', error);
      return true; // Assume permissions are available if we can't check
    }
  }

  /**
   * Start scanning for NFC tags
   */
  async startScanning(
    onRead: (result: NFCReadResult) => void,
    onError: (error: NFCError) => void
  ): Promise<() => void> {
    if (!this.isSupported) {
      onError({ message: 'NFC is not supported in this browser', code: 'NOT_SUPPORTED' });
      return () => {};
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        onError({ message: 'NFC permission denied', code: 'PERMISSION_DENIED' });
        return () => {};
      }

      const reader = new (window as any).NDEFReader();
      
      // Handle successful reads
      reader.addEventListener('reading', (event: any) => {
        const { message, serialNumber } = event;
        
        let data: string | undefined;
        
        // Try to extract text data from the NFC tag
        if (message && message.records && message.records.length > 0) {
          const textRecord = message.records.find((record: any) => 
            record.recordType === 'text' || record.mediaType === 'text/plain'
          );
          
          if (textRecord) {
            const decoder = new TextDecoder();
            data = decoder.decode(textRecord.data);
          }
        }

        onRead({
          uid: serialNumber || 'unknown',
          data,
          type: 'nfc',
        });
      });

      // Handle errors
      reader.addEventListener('readingerror', (event: any) => {
        onError({
          message: event.message || 'Failed to read NFC tag',
          code: 'READ_ERROR',
        });
      });

      // Start scanning
      await reader.scan();

      // Return cleanup function
      return () => {
        try {
          reader.stop?.();
        } catch (error) {
          console.warn('Error stopping NFC reader:', error);
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown NFC error';
      onError({ message: errorMessage, code: 'SCAN_ERROR' });
      return () => {};
    }
  }

  /**
   * Write data to an NFC tag (requires user interaction)
   */
  async writeTag(data: string): Promise<void> {
    if (!this.isSupported) {
      throw new Error('NFC is not supported in this browser');
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('NFC permission denied');
      }

      const writer = new (window as any).NDEFReader();
      
      await writer.write({
        records: [
          {
            recordType: 'text',
            data: data,
          },
        ],
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to write NFC tag';
      throw new Error(errorMessage);
    }
  }

  /**
   * Format a raw NFC UID for display
   */
  formatUID(uid: string): string {
    if (!uid || uid === 'unknown') return 'Unknown';
    
    // Convert to uppercase and add colons if it's a hex string
    if (/^[0-9a-fA-F]+$/.test(uid) && uid.length > 4) {
      return uid.toUpperCase().replace(/(.{2})/g, '$1:').slice(0, -1);
    }
    
    return uid.toUpperCase();
  }

  /**
   * Validate if a string looks like a valid NFC UID
   */
  isValidUID(uid: string): boolean {
    if (!uid || uid === 'unknown') return false;
    
    // Check if it's a hex string of appropriate length (4-10 bytes = 8-20 hex chars)
    const hexPattern = /^[0-9a-fA-F:]{8,23}$/;
    const cleanUID = uid.replace(/:/g, '');
    
    return hexPattern.test(uid) && cleanUID.length >= 8 && cleanUID.length <= 20;
  }
}

// Export singleton instance
export const nfcManager = new NFCManager();

// React hook for NFC functionality
import { useState, useCallback, useEffect } from 'react';

export function useNFC() {
  const [isScanning, setIsScanning] = useState(false);
  const [isSupported] = useState(nfcManager.isNFCSupported());
  const [error, setError] = useState<NFCError | null>(null);

  const startScanning = useCallback(
    async (onRead: (result: NFCReadResult) => void) => {
      if (isScanning) return;

      setError(null);
      setIsScanning(true);

      try {
        const stopScanning = await nfcManager.startScanning(
          (result) => {
            onRead(result);
            setIsScanning(false);
          },
          (nfcError) => {
            setError(nfcError);
            setIsScanning(false);
          }
        );

        // Auto-cleanup after 30 seconds
        setTimeout(() => {
          if (isScanning) {
            stopScanning();
            setIsScanning(false);
          }
        }, 30000);

      } catch (err) {
        setError({
          message: err instanceof Error ? err.message : 'Failed to start NFC scanning',
          code: 'START_ERROR',
        });
        setIsScanning(false);
      }
    },
    [isScanning]
  );

  const writeTag = useCallback(async (data: string) => {
    try {
      setError(null);
      await nfcManager.writeTag(data);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to write NFC tag',
        code: 'WRITE_ERROR',
      });
      throw err;
    }
  }, []);

  return {
    isSupported,
    isScanning,
    error,
    startScanning,
    writeTag,
    formatUID: nfcManager.formatUID,
    isValidUID: nfcManager.isValidUID,
  };
}
