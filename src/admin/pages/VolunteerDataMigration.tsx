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
// import * as crypto from 'crypto';

// Define the volunteer schema interface based on your table
interface Volunteer {
  id?: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  skills?: any; // JSON field
  interests?: any; // JSON field
  availability?: string;
  experience?: string;
  how_heard?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  rating?: number;
  profile_image?: string;
  badges?: string;
  bio?: string;
  last_active?: string;
}

const VolunteerDataMigration = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // All volunteer table columns with default no-value
  const volunteerColumns = [
    'email', 'password', 'first_name', 'last_name', 'phone', 'address', 
    'city', 'state', 'skills', 'interests', 'availability', 'experience', 
    'how_heard', 'rating', 'profile_image', 'badges', 'bio'
  ];

  // Required fields for validation
  const requiredFields = ['email', 'first_name'];

  // Generate a complex, unique password
  const generateComplexPassword = (data: any): string => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:'\",.<>?/";

    // Generate a random password length between 7 and 14
    const passwordLength = Math.floor(Math.random() * 8) + 7; 

    let password = "";

    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill remaining characters randomly
    const allChars = uppercase + lowercase + digits + symbols;
    for (let i = password.length; i < passwordLength; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to randomize order
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
};


  // Split name into first and last name
  const splitName = (name: string): { first_name: string, last_name: string } => {
    if (!name) return { first_name: '', last_name: 'NA' };
    
    const parts = name.trim().split(/\s+/);
    
    if (parts.length === 0) {
      return { first_name: '', last_name: 'NA' };
    } else if (parts.length === 1) {
      return { first_name: parts[0], last_name: 'NA' };
    } else {
      return { 
        first_name: parts[0], 
        last_name: parts.slice(1).join(' ') 
      };
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    
    // Read the file
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
          return;
        }
        
        // Get headers from the first row
        const fileHeaders = Object.keys(jsonData[0]);
        setHeaders(fileHeaders);
        
        // Set default mapping if column names match
        const initialMapping: Record<string, string> = {};
        fileHeaders.forEach(header => {
          const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
          if (volunteerColumns.includes(normalizedHeader)) {
            initialMapping[header] = normalizedHeader;
          }
        });
        setColumnMapping(initialMapping);
        
        // Show preview of first 5 rows
        setPreviewData(jsonData.slice(0, 5));
      } catch (err) {
        console.error("Error parsing file:", err);
        setError("Failed to parse the file. Please make sure it's a valid Excel or CSV file.");
      }
    };
    
    reader.readAsBinaryString(uploadedFile);
  };

  const handleColumnMappingChange = (fileColumn: string, dbColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [fileColumn]: dbColumn || 'skip'  // Use 'skip' instead of empty string
    }));
  };

  const processJsonField = (value: any): any => {
    if (!value) return null;
    
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        // If it's a comma-separated string, convert to array
        if (value.includes(',')) {
          return value.split(',').map(item => item.trim());
        }
        return value;
      }
    }
    
    return value;
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
      // Read all data from file
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
            
            const volunteers: Volunteer[] = batch.map(row => {
                const volunteer: Partial<Volunteer> = {};
              
                // Map columns based on user configuration
                Object.entries(columnMapping).forEach(([fileCol, dbCol]) => {
                  // Skip columns mapped to 'skip'
                  if (dbCol === 'skip') return;
              
                  const value = row[fileCol];
              
                  if (dbCol === 'skills' || dbCol === 'interests') {
                    // Ensure skills and interests are stored as lists
                    volunteer[dbCol] = value ? value.split(',').map(item => item.trim()) : [];
                  } else if (dbCol === 'rating') {
                    volunteer[dbCol] = value ? Number(value) : null;
                  } else if (dbCol === 'availability' && typeof value === 'string') {
                    volunteer[dbCol] = value.toLowerCase(); // Convert availability to lowercase
                  } else {
                    volunteer[dbCol] = value;
                  }
                });
              
                // Set last_name to "Mig"
                volunteer.last_name = "Mig";
              
                // Generate a unique password for each volunteer
                volunteer.password = generateComplexPassword(row);
              
                // Ensure email is present
                if (!volunteer.email) {
                  throw new Error('Email is required but not provided');
                }
              
                // Add metadata
                volunteer.created_at = new Date().toISOString();
                volunteer.updated_at = new Date().toISOString();
                
                // Always set status to "not active"
                volunteer.status = "not active";
              
                return volunteer as Volunteer;
              });
              
              
            
            // Insert volunteers into the database
           // Insert volunteers into the database
const { data: insertedData, error: insertError } = await supabase
.from('volunteer')
.insert(volunteers);

if (insertError) {
console.error("Detailed Supabase Error:", insertError);
console.log("Problematic Volunteers:", volunteers);
// You might want to log each volunteer individually to identify which one fails
for (const volunteer of volunteers) {
  const { error: singleInsertError } = await supabase
    .from('volunteer')
    .insert(volunteer);
  
  if (singleInsertError) {
    console.error("Error with specific volunteer:", singleInsertError, volunteer);
  }
}

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Volunteer Data Migration</CardTitle>
        <CardDescription>
          Upload an Excel or CSV file to import volunteer data into the system.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!file && (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-2 text-sm text-gray-500">
              Upload Excel (.xlsx, .xls) or CSV files
            </p>
          </div>
        )}
        
        {file && headers.length > 0 && (
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
                Map columns from your file to the volunteer database fields. 
                Required fields: email, first_name, last_name
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
                        {volunteerColumns.map(col => (
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
              Migration complete! Successfully imported {result.success} volunteers.
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
  );
};

export default VolunteerDataMigration;