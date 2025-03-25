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
import LoadingSpinner from '@/components/LoadingSpinner';

// Donation schema interface
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
  created_at?: string;
  updated_at?: string;
  organization_id?: string;
}

const DonationDataMigration = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { adminUser, logout } = useAuth();
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // All donation table columns with default no-value
  const donationColumns = [
    'amount', 'donation_type', 'donation_purpose', 'payment_method', 
    'payment_status', 'transaction_id', 'donor_name', 'donor_email', 
    'donor_phone', 'donor_address', 'pan_number', 'donor_message', 
    'receive_updates'
  ];

  // Required fields for validation
  const requiredFields = ['amount', 'donor_name', 'donor_email'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setIsFileProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          setError("The file appears to be empty or invalid.");
          setIsFileProcessing(false);
          return;
        }
        
        // Get headers from the first row
        const fileHeaders = Object.keys(jsonData[0]);
        setHeaders(fileHeaders);
        
        // Set default mapping if column names match
        const initialMapping: Record<string, string> = {};
        fileHeaders.forEach(header => {
          const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
          if (donationColumns.includes(normalizedHeader)) {
            initialMapping[header] = normalizedHeader;
          }
        });
        setColumnMapping(initialMapping);
        
        // Show preview of first 5 rows
        setPreviewData(jsonData.slice(0, 5));
        setIsFileProcessing(false);
      } catch (err) {
        console.error("Error parsing file:", err);
        setError("Failed to parse the file. Please make sure it's a valid Excel or CSV file.");
        setIsFileProcessing(false);
      }
    };
    
    reader.readAsBinaryString(uploadedFile);
  };

  const handleColumnMappingChange = (fileColumn: string, dbColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [fileColumn]: dbColumn || 'skip'
    }));
  };

  const handleMigration = async () => {
    if (!file || !user) return;
    
    // Check if required fields are mapped
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
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
          
          let successCount = 0;
          let failCount = 0;
          
          // Process in batches to improve performance
          const batchSize = 20;
          const totalBatches = Math.ceil(jsonData.length / batchSize);
          
          for (let i = 0; i < jsonData.length; i += batchSize) {
            const batch = jsonData.slice(i, i + batchSize);
            
            const donations: Donation[] = batch.map(row => {
              const donation: Partial<Donation> = {
                donation_type: 'Online',
                payment_method: 'Online',
                payment_status: 'Completed',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              
              // Map columns based on user configuration
              Object.entries(columnMapping).forEach(([fileCol, dbCol]) => {
                if (dbCol === 'skip') return;
              
                const value = row[fileCol];
              
                if (dbCol === 'amount') {
                  donation[dbCol] = Number(value) || 0;
                } else if (dbCol === 'receive_updates') {
                  donation[dbCol] = value === 'Yes' || false;
                } else {
                  donation[dbCol as keyof Donation] = value;
                }
              });
              
              return donation as Donation;
            });
            
            // Insert donations into the database
            const { data: insertedData, error: insertError } = await supabase
              .from('donation')
              .insert(donations);

            if (insertError) {
              console.error("Detailed Supabase Error:", insertError);
              failCount += batch.length;
            } else {
              successCount += batch.length;
            }
            
            // Update progress
            setProgress(Math.round(((i + batch.length) / jsonData.length) * 100));
          }
          
          setResult({ success: successCount, failed: failCount });
          setIsLoading(false);
        } catch (err) {
          console.error("Error processing data:", err);
          setError("An error occurred while processing the data.");
          setIsLoading(false);
        }
      };
      
      reader.readAsBinaryString(file);
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
          <Card className="w-full max-w-6xl mx-auto mt-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Donation Data Migration</CardTitle>
                  <CardDescription className='mt-2'>
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
              
              {isFileProcessing && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              )}
              
              {file && !isFileProcessing && headers.length > 0 && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">File Preview</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {headers.map(header => (
                              <TableHead key={header}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.map((row, index) => (
                            <TableRow key={index}>
                              {headers.map(header => (
                                <TableCell key={`${index}-${header}`}>
                                  {row[header]?.toString() || ''}
                                </TableCell>
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
                      {headers.map(header => (
                        <div key={header} className="flex items-center gap-2">
                          <span className="min-w-32 font-medium">{header}:</span>
                          <Select
                            value={columnMapping[header] || 'skip'}
                            onValueChange={(value) => handleColumnMappingChange(header, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skip">Skip this column</SelectItem>
                              {donationColumns.map(col => (
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
                      setPreviewData([]);
                      setHeaders([]);
                      setColumnMapping({});
                      setResult(null);
                      setError(null);
                    }}
                  >
                    Reset
                  </Button>
                )}
                
                {file && headers.length > 0 && (
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