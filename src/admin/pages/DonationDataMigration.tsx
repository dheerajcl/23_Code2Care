import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

// Donation table columns
const DONATION_COLUMNS = [
  'amount', 
  'donation_type', 
  'donation_purpose', 
  'payment_method', 
  'payment_status', 
  'transaction_id',
  'donor_name', 
  'donor_email', 
  'donor_phone', 
  'donor_address', 
  'pan_number', 
  'donor_message', 
  'receive_updates'
] as const;

// Donation table schema interface
interface Donation {
  id?: string;
  amount: number;
  donation_type: string;
  donation_purpose: string;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  donor_address: string;
  pan_number?: string;
  donor_message?: string;
  receive_updates: boolean;
  created_at?: Date;
  updated_at?: Date;
  organization_id?: string;
}

// Explicitly type the column mapping
type DonationColumn = typeof DONATION_COLUMNS[number];

const DonationUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, DonationColumn | ''>>({});
  const [previewData, setPreviewData] = useState<Array<Record<string, any>>>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      parseFile(uploadedFile);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Get columns from first row
      const columns = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
      setFileColumns(columns);

      // Reset column mapping
      const initialMapping: Record<string, DonationColumn | ''> = {};
      columns.forEach(col => initialMapping[col] = '');
      setColumnMapping(initialMapping);

      // Get preview data
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setPreviewData(jsonData.slice(0, 5)); // Preview first 5 rows
    };
    reader.readAsArrayBuffer(file);
  };

  const handleColumnMapChange = (fileColumn: string, donationColumn: DonationColumn) => {
    setColumnMapping(prev => ({
      ...prev,
      [fileColumn]: donationColumn
    }));
  };

  const transformDonations = (): Donation[] => {
    return previewData.map(row => {
      const donation: Partial<Donation> = {
        amount: 0,
        donation_type: 'Online',
        donation_purpose: '',
        payment_method: 'Online',
        payment_status: 'Completed',
        donor_name: '',
        donor_email: '',
        donor_phone: '',
        donor_address: '',
        receive_updates: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Map columns based on user selection
      Object.entries(columnMapping).forEach(([fileCol, donationCol]) => {
        if (donationCol) {
          switch (donationCol) {
            case 'amount':
              donation.amount = parseFloat(row[fileCol]) || 0;
              break;
            case 'receive_updates':
              donation.receive_updates = row[fileCol] === 'Yes' || false;
              break;
            default:
              (donation as any)[donationCol] = row[fileCol] || '';
          }
        }
      });

      return donation as Donation;
    });
  };

  const uploadDonations = async () => {
    const donations = transformDonations();

    try {
      const { data, error } = await supabase
        .from('donation')
        .insert(donations);

      if (error) throw error;

      toast.success(`Successfully uploaded ${donations.length} donations`);
      
      // Reset state
      setFile(null);
      setFileColumns([]);
      setColumnMapping({});
      setPreviewData([]);
    } catch (error) {
      console.error('Error uploading donations:', error);
      toast.error('Failed to upload donations');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Donation Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <input 
          type="file" 
          accept=".xlsx,.xls,.csv" 
          onChange={handleFileUpload} 
          className="mb-4 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {fileColumns.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Column Mapping</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Column</TableHead>
                  <TableHead>Donation Table Column</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fileColumns.map(fileColumn => (
                  <TableRow key={fileColumn}>
                    <TableCell>{fileColumn}</TableCell>
                    <TableCell>
                      <Select 
                        onValueChange={(value: DonationColumn) => handleColumnMapChange(fileColumn, value)}
                        value={columnMapping[fileColumn] || ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Map to column" />
                        </SelectTrigger>
                        <SelectContent>
                          {DONATION_COLUMNS.map(tableCol => (
                            <SelectItem key={tableCol} value={tableCol}>
                              {tableCol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {previewData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Preview Data</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(previewData[0]).map(col => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value, colIndex) => (
                      <TableCell key={colIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {fileColumns.length > 0 && (
          <Button 
            onClick={uploadDonations} 
            className="mt-4"
            disabled={!Object.values(columnMapping).some(val => val !== '')}
          >
            Upload Donations
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DonationUpload;