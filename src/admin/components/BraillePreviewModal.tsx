import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileDown, Eye, FileText, FileType } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';

interface BraillePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  brailleText: string;
  originalText: string;
  onDownload: (type: 'pdf' | 'txt') => void;
  taskTitle: string;
}

export const BraillePreviewModal = ({
  isOpen,
  onClose,
  brailleText,
  originalText,
  onDownload,
  taskTitle
}: BraillePreviewModalProps) => {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileType className="h-5 w-5 text-primary" />
            <span>Task Preview: {taskTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <Alert className="my-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Choose your preferred download format:
            <ul className="list-disc ml-4 mt-2">
              <li>PDF Format: Creates a printable document with both text and braille characters - perfect for flyers and handouts</li>
              <li>TXT Format: Contains only braille characters - useful for digital braille readers or specialized software</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex items-center space-x-2 py-4">
          <Switch
            id="preview-toggle"
            checked={showOriginal}
            onCheckedChange={setShowOriginal}
          />
          <Label htmlFor="preview-toggle">
            {showOriginal ? 'Showing Text Version' : 'Showing Braille Version'}
          </Label>
        </div>

        <div className="h-[400px] w-full rounded-md border p-4 overflow-auto">
          <pre className="whitespace-pre-wrap font-mono min-w-full">
            {showOriginal ? originalText : brailleText}
          </pre>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onDownload('pdf')}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Download Printable PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => onDownload('txt')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Download Braille TXT
            </Button>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 