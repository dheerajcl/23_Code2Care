import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

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

const DonationDataMigration: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, DonationColumn | 'skip'>>({});
  const [previewData, setPreviewData] = useState<Array<Record<string, any>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.logout();
    navigate('/admin/login');
  };

  // Required fields for validation
  const requiredFields = ['amount', 'donor_name', 'donor_email'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Get columns from first row
        const columns = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
        setFileColumns(columns);

        // Reset column mapping with default options
        const initialMapping: Record<string, DonationColumn | 'skip'> = {};
        columns.forEach(col => {
          const normalizedCol = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const matchedColumn = DONATION_COLUMNS.find(dc => dc.includes(normalizedCol)) || 'skip';
          initialMapping[col] = matchedColumn;
        });
        setColumnMapping(initialMapping);

        // Get preview data
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setPreviewData(jsonData.slice(0, 5)); // Preview first 5 rows
      } catch (err) {
        console.error("Error parsing file:", err);
        setError("Failed to parse the file. Please make sure it's a valid Excel or CSV file.");
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleColumnMappingChange = (fileColumn: string, donationColumn: DonationColumn | 'skip') => {
    setColumnMapping(prev => ({
      ...prev,
      [fileColumn]: donationColumn
    }));
  };

  const handleMigration = async () => {
    // Validate required fields are mapped
    const mappedRequiredFields = requiredFields.filter(
      field => Object.values(columnMapping).includes(field)
    );
    
    if (mappedRequiredFields.length < requiredFields.length) {
      setError(`Missing required fields: ${requiredFields
        .filter(f => !mappedRequiredFields.includes(f))
        .join(', ')}`);
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      const donations: Donation[] = previewData.map(row => {
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
          if (donationCol && donationCol !== 'skip') {
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

      // Process in batches
      const batchSize = 20;
      const totalBatches = Math.ceil(donations.length / batchSize);
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < donations.length; i += batchSize) {
        const batch = donations.slice(i, i + batchSize);
        
        const { data, error: insertError } = await supabase
          .from('donation')
          .insert(batch);

        if (insertError) {
          console.error("Batch insert error:", insertError);
          failCount += batch.length;
        } else {
          successCount += batch.length;
        }

        // Update progress
        setProgress(Math.round(((i + batch.length) / donations.length) * 100));
      }

      setResult({ success: successCount, failed: failCount });
      setIsLoading(false);
    } catch (err) {
      console.error("Migration error:", err);
      setError("An error occurred during migration.");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <AdminHeader user={auth.user} handleLogout={handleLogout} title="Donation Data Migration" />

      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <AdminSidebar />
        
        <main className="flex-1 overflow-y-auto p-4">
          <Card className="w-full max-w-4xl mx-auto mt-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Donation Data Migration</CardTitle>
                  <CardDescription>
                    Upload an Excel or CSV file to import donation data into the database.
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => navigate('/admin/migration')} 
                  className='bg-purple-600 hover:bg-purple-700 text-white' 
                  variant="outline"
                >
                  Go Back
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {!file && (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                  <div className="flex justify-center items-center ml-20">
                    <input
                      type="file"
                      aria-label="upload-csv-file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="block w-full max-w-xs text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>

                  <p className="mt-10 text-sm text-gray-500">
                    Upload Excel (.xlsx, .xls) or CSV (.csv) files
                  </p>
                </div>
              )}
              
              {file && fileColumns.length > 0 && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">File Preview</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(previewData[0]).map(header => (
                              <TableHead key={header}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.map((row, index) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value, colIndex) => (
                                <TableCell key={colIndex}>{value?.toString() || ''}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Column Mapping</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Map columns from your file to the donation database fields. 
                      Required fields: amount, donor_name, donor_email
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fileColumns.map(header => (
                        <div key={header} className="flex items-center gap-2">
                          <span className="min-w-32 font-medium">{header}:</span>
                          <Select
                            value={columnMapping[header] || 'skip'}
                            onValueChange={(value: DonationColumn | 'skip') => handleColumnMappingChange(header, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skip">Skip this column</SelectItem>
                              {DONATION_COLUMNS.map(col => (
                                <SelectItem key={col} value={col}>
                                  {col} {requiredFields.includes(col) ? '(required)' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {isLoading && (
                <div className="my-4">
                  <p className="mb-2 text-sm">Processing your data... {progress}%</p>
                  <Progress value={progress} />
                </div>
              )}
              
              {error && (
                <Alert variant="destructive" className="my-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {result && (
                <Alert className="my-4">
                  <AlertDescription>
                    Migration complete! Successfully imported {result.success} donations.
                    {result.failed > 0 && ` Failed to import ${result.failed} records.`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter>
              <div className="flex gap-2">
                {file && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFile(null);
                      setFileColumns([]);
                      setColumnMapping({});
                      setPreviewData([]);
                      setResult(null);
                      setError(null);
                    }}
                  >
                    Reset
                  </Button>
                )}
                
                {file && fileColumns.length > 0 && (
                  <Button 
                    onClick={handleMigration}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Migrating...' : 'Start Migration'}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default DonationDataMigration;