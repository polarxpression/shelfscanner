
"use client";

import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from './ui/button';
import { RefreshCw, ZapOff } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation.tsx';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onManualAdd: () => void;
}

export function BarcodeScanner({ onScan, onManualAdd }: BarcodeScannerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      // Check if BarcodeDetector is available
      if (!('BarcodeDetector' in window)) {
        console.error('Barcode Detector is not supported by this browser.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t('unsupportedBrowserTitle'),
          description: t('unsupportedBrowserDescription'),
        });
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
          title: t('cameraAccessDeniedTitle'),
          description: t('cameraAccessDeniedDescription'),
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
  }, [toast, t]);

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
            <AlertTitle className="text-destructive text-lg">{t('cameraErrorTitle')}</AlertTitle>
            <AlertDescription className="text-white mb-6">
              {t('cameraErrorDescription')}
            </AlertDescription>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                <Button onClick={handleRetry} variant="secondary" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('retry')}
                </Button>
                <Button onClick={onManualAdd} variant="outline" className="w-full">{t('addManually')}</Button>
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
