"use client";

import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from './ui/button';
import { RefreshCw, ZapOff } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onManualAdd: () => void;
}

export function BarcodeScanner({ onScan, onManualAdd }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      // Check if BarcodeDetector is available
      if (!('BarcodeDetector' in window)) {
        console.error('Barcode Detector is not supported by this browser.');
        setHasCameraPermission(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Stop camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  useEffect(() => {
    if (!hasCameraPermission) return;

    // @ts-ignore - BarcodeDetector is not in all TS lib versions yet
    const barcodeDetector = new window.BarcodeDetector({ formats: ['ean_13', 'upc_a', 'upc_e', 'ean_8', 'code_128', 'code_39', 'qr_code'] });
    let intervalId: NodeJS.Timeout;

    const detectBarcode = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            onScan(barcodes[0].rawValue);
            // Vibrate for feedback
            if('vibrate' in navigator) navigator.vibrate(100);
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error('Barcode detection failed:', error);
        }
      }
    };

    intervalId = setInterval(detectBarcode, 500);

    return () => clearInterval(intervalId);
  }, [hasCameraPermission, onScan]);


  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />

      {hasCameraPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-md p-4 text-center">
            <ZapOff className="h-12 w-12 text-destructive mb-4" />
            <AlertTitle className="text-destructive text-lg">Camera Error</AlertTitle>
            <AlertDescription className="text-white mb-6">
              Could not access the camera. This might be due to a lack of permissions or browser support.
            </AlertDescription>
            <div className="flex gap-2">
                <Button onClick={handleRetry} variant="secondary">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
                <Button onClick={onManualAdd} variant="outline">Add Manually</Button>
            </div>
        </div>
      )}
      {hasCameraPermission === true && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-1/3 border-4 border-primary/50 rounded-lg shadow-lg" style={{
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
              }}></div>
          </div>
      )}
    </div>
  );
}
