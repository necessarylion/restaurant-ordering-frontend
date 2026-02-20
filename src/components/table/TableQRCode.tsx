/**
 * Table QR Code Component
 * Displays QR code for table ordering with download functionality
 */

import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, PrinterIcon } from "@hugeicons/core-free-icons";

interface TableQRCodeProps {
  tableName: string;
  restaurantId: number;
  token: string;
  expiresAt: string;
  onClose: () => void;
}

export const TableQRCode = ({
  tableName,
  restaurantId,
  token,
  expiresAt,
  onClose,
}: TableQRCodeProps) => {
  // Generate the guest ordering URL with restaurant ID
  const orderUrl = `${window.location.origin}/guest/${restaurantId}/${token}`;

  const handleDownload = () => {
    const canvas = document.getElementById(
      "qr-code-canvas"
    ) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tableName}-qr-code.png`;
      link.click();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const canvas = document.getElementById(
        "qr-code-canvas"
      ) as HTMLCanvasElement;
      const dataUrl = canvas.toDataURL();

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${tableName}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                font-family: system-ui, -apple-system, sans-serif;
              }
              h1 {
                margin-bottom: 1rem;
              }
              img {
                border: 2px solid #000;
                padding: 1rem;
              }
              p {
                margin-top: 1rem;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h1>${tableName}</h1>
            <img src="${dataUrl}" alt="QR Code" />
            <p>Scan to order</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{tableName} - QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeCanvas
            id="qr-code-canvas"
            value={orderUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Expiry Information */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Token expires: {formatExpiry(expiresAt)}</p>
          <p className="mt-1 text-xs">Guests can scan this code to place orders</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1">
            <HugeiconsIcon
              icon={Download01Icon}
              strokeWidth={2}
              className="size-4 mr-1"
            />
            Download
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <HugeiconsIcon
              icon={PrinterIcon}
              strokeWidth={2}
              className="size-4 mr-1"
            />
            Print
          </Button>
        </div>

        <Button onClick={onClose} variant="outline" className="w-full">
          Close
        </Button>
      </CardContent>
    </Card>
  );
};
