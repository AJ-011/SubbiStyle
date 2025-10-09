import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface QrScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function QrScanner({ onScan, onError, isOpen, onOpenChange }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const { startScanning, stopScanning, isSupported } = useQrScanner({
    onScan: (code) => {
      onScan(code);
      handleStopScanning();
    },
    onError: (err) => {
      setError(err);
      onError?.(err);
    },
  });

  const handleStartScanning = async () => {
    if (!videoRef.current || !isSupported) {
      setError("QR scanning is not supported on this device");
      return;
    }

    try {
      setError(null);
      setIsScanning(true);

      // Get camera stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();

      // Start QR code detection
      await startScanning(videoRef.current);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
      setError(errorMessage);
      setIsScanning(false);
      onError?.(errorMessage);
    }
  };

  const handleStopScanning = () => {
    stopScanning();
    setIsScanning(false);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      handleStopScanning();
    };
  }, []);

  const ScannerContent = () => (
    <div className="space-y-4">
      {!isSupported ? (
        <div className="text-center py-8" data-testid="scanner-not-supported">
          <i className="fas fa-exclamation-triangle text-4xl text-muted-foreground mb-4"></i>
          <p className="text-muted-foreground">
            QR code scanning is not supported on this device
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-8" data-testid="scanner-error">
          <i className="fas fa-exclamation-circle text-4xl text-destructive mb-4"></i>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => setError(null)} variant="outline">
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <div className="relative qr-scanner" data-testid="scanner-video">
            <video
              ref={videoRef}
              className="w-full h-64 bg-black rounded-lg object-cover"
              playsInline
              muted
            />
            {isScanning && (
              <div className="qr-scanner-overlay">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-primary rounded-lg"></div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center space-y-4">
            {isScanning ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Point your camera at a QR code to scan
                </p>
                <Button 
                  onClick={handleStopScanning} 
                  variant="outline"
                  data-testid="button-stop-scanning"
                >
                  <i className="fas fa-stop mr-2"></i>
                  Stop Scanning
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Tap the button below to start scanning QR codes
                </p>
                <Button 
                  onClick={handleStartScanning}
                  data-testid="button-start-scanning"
                >
                  <i className="fas fa-camera mr-2"></i>
                  Start Scanning
                </Button>
              </>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Make sure the QR code is clearly visible and well-lit
            </p>
          </div>
        </>
      )}
    </div>
  );

  if (isOpen !== undefined && onOpenChange) {
    // Controlled dialog mode
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" data-testid="qr-scanner-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <i className="fas fa-qrcode text-primary"></i>
              Scan QR Code
            </DialogTitle>
          </DialogHeader>
          <ScannerContent />
        </DialogContent>
      </Dialog>
    );
  }

  // Standalone mode
  return (
    <Card data-testid="qr-scanner-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-qrcode text-primary text-xl"></i>
          <h3 className="font-semibold text-lg">QR Scanner</h3>
        </div>
        <ScannerContent />
      </CardContent>
    </Card>
  );
}

// Trigger component for easy integration
export function QrScannerTrigger({ onScan, onError, children }: {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <i className="fas fa-qrcode text-primary"></i>
            Scan QR Code
          </DialogTitle>
        </DialogHeader>
        <QrScanner
          onScan={(code) => {
            onScan(code);
            setIsOpen(false);
          }}
          onError={onError}
        />
      </DialogContent>
    </Dialog>
  );
}
