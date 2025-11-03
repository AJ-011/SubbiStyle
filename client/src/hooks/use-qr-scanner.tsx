import { useRef, useCallback } from 'react';

interface QrScannerOptions {
  onScan: (code: string) => void;
  onError: (error: string) => void;
  scanDelay?: number;
}

interface QrScannerHook {
  startScanning: (video: HTMLVideoElement) => Promise<void>;
  stopScanning: () => void;
  isSupported: boolean;
}

export function useQrScanner({
  onScan,
  onError,
  scanDelay = 100,
}: QrScannerOptions): QrScannerHook {
  const scannerRef = useRef<{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    scanInterval?: NodeJS.Timeout;
  } | null>(null);

  // Check if browser supports required APIs
  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    'getUserMedia' in navigator.mediaDevices &&
    'BarcodeDetector' in window;

  const detectQRCode = useCallback(
    async (video: HTMLVideoElement) => {
      if (!scannerRef.current || !window.BarcodeDetector) return;

      const { canvas, context } = scannerRef.current;

      try {
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data from canvas
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Use native BarcodeDetector API if available
        if (window.BarcodeDetector) {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['qr_code']
          });
          
          const barcodes = await barcodeDetector.detect(imageData);
          
          if (barcodes.length > 0) {
            const qrCode = barcodes[0];
            onScan(qrCode.rawValue);
            return;
          }
        }
        
        // Fallback: Simple pattern detection (very basic)
        // This is a simplified approach and may not work for all QR codes
        const pixels = imageData.data;
        let darkPixels = 0;
        let lightPixels = 0;
        
        // Sample every 4th pixel for performance
        for (let i = 0; i < pixels.length; i += 16) {
          const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
          if (brightness < 128) darkPixels++;
          else lightPixels++;
        }
        
        // Very basic QR code detection heuristic
        const ratio = darkPixels / (darkPixels + lightPixels);
        if (ratio > 0.3 && ratio < 0.7) {
          // This is a very simplified detection - in reality, you'd need
          // a proper QR code detection library
          console.log('Possible QR code detected, but cannot decode without proper library');
        }
        
      } catch (error) {
        console.error('QR detection error:', error);
      }
    },
    [onScan]
  );

  const startScanning = useCallback(
    async (video: HTMLVideoElement): Promise<void> => {
      if (!isSupported) {
        onError('QR code scanning is not supported in this browser');
        return;
      }

      try {
        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not get canvas context');
        }

        // Set canvas size to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        scannerRef.current = { canvas, context };

        // Start scanning interval
        const scanInterval = setInterval(() => {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            detectQRCode(video);
          }
        }, scanDelay);

        scannerRef.current.scanInterval = scanInterval;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start scanning';
        onError(errorMessage);
      }
    },
    [isSupported, onError, detectQRCode, scanDelay]
  );

  const stopScanning = useCallback(() => {
    if (scannerRef.current?.scanInterval) {
      clearInterval(scannerRef.current.scanInterval);
      scannerRef.current.scanInterval = undefined;
    }
    scannerRef.current = null;
  }, []);

  return {
    startScanning,
    stopScanning,
    isSupported,
  };
}

// Extend Window interface to include BarcodeDetector
declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats: string[] }): {
        detect: (source: ImageData | HTMLCanvasElement | HTMLVideoElement) => Promise<{
          rawValue: string;
          format: string;
          boundingBox: DOMRectReadOnly;
          cornerPoints: Array<{ x: number; y: number }>;
        }[]>;
      };
    };
  }
}
