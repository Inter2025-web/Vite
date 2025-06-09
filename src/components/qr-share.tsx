import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Share, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

export function QRShare() {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const currentUrl = window.location.href;

  useEffect(() => {
    if (isOpen) {
      generateQRCode();
    }
  }, [isOpen]);

  const generateQRCode = async () => {
    try {
      const qrOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };
      
      const dataUrl = await QRCode.toDataURL(currentUrl, qrOptions);
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el código QR",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({
        title: "Copiado",
        description: "URL copiada al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar la URL",
        variant: "destructive",
      });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sistema de Inventario Digital',
          text: 'Accede al sistema de inventario desde tu celular',
          url: currentUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2"
        >
          <QrCode className="h-4 w-4" />
          <span>Compartir QR</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            Compartir Sistema de Inventario
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4">
            {qrDataUrl ? (
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <img 
                  src={qrDataUrl} 
                  alt="QR Code para acceder al sistema" 
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <QrCode className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Generando código QR...</p>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600 text-center max-w-xs">
              Escanea este código QR con la cámara de tu celular para acceder al sistema de inventario
            </p>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">URL del Sistema</p>
                <p className="text-xs text-gray-500 truncate">{currentUrl}</p>
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="ml-3 flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="ml-1 text-green-600">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="ml-1">Copiar</span>
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={shareNative}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Share className="h-4 w-4" />
                <span>Compartir con Otros</span>
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Instrucciones para móviles:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Abre la cámara de tu celular</li>
                <li>• Apunta hacia el código QR</li>
                <li>• Toca la notificación que aparece</li>
                <li>• Se abrirá el sistema en tu navegador</li>
                <li>• Guarda la página en favoritos para acceso rápido</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}