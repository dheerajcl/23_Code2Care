import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/db/schema/donations';
import { z } from 'zod';

// Validation schema for donation data
const donationSchema = z.object({
  amount: z.number().positive(),
  donationType: z.enum(['oneTime', 'monthly']),
  donationPurpose: z.enum(['education', 'skill', 'livelihood', 'sports', 'cultural', 'general']),
  paymentMethod: z.enum(['card', 'upi', 'netbanking']),
  personalInfo: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().optional(),
    panNumber: z.string().optional(),
    message: z.string().optional(),
  }),
  receiveUpdates: z.boolean().default(false),
  organizationId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    const validatedData = donationSchema.parse(body);
    
    // Create a payment transaction (in a real app, this would integrate with a payment gateway)
    // For now, we'll assume it was successful and generate a mock transaction ID
    const mockTransactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Insert the donation into the database
    const newDonation = await db.insert(donations).values({
      amount: validatedData.amount,
      donationType: validatedData.donationType,
      donationPurpose: validatedData.donationPurpose,
      paymentMethod: validatedData.paymentMethod,
      paymentStatus: 'completed', // In a real app, this would be pending until payment confirmation
      transactionId: mockTransactionId,
      
      // Donor information
      donorName: validatedData.personalInfo.name,
      donorEmail: validatedData.personalInfo.email,
      donorPhone: validatedData.personalInfo.phone,
      donorAddress: validatedData.personalInfo.address || null,
      panNumber: validatedData.personalInfo.panNumber || null,
      donorMessage: validatedData.personalInfo.message || null,
      
      // Preferences
      receiveUpdates: validatedData.receiveUpdates,
      
      // Organization
      organizationId: validatedData.organizationId || null,
    }).returning();
    
    // Return the created donation
    return NextResponse.json({ 
      success: true, 
      message: "Donation processed successfully", 
      data: newDonation[0],
      transactionId: mockTransactionId
    }, { status: 201 });
    
  } catch (error) {
    console.error("Donation processing error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        message: "Validation error", 
        errors: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to process donation" 
    }, { status: 500 });
  }
}

// GET endpoint to retrieve donations (admin only - would need authentication middleware)
export async function GET(request: NextRequest) {
  try {
    // In a real app, you would check for admin authentication here
    // const isAdmin = await checkAdminAuth(request);
    // if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const allDonations = await db.select().from(donations).orderBy(donations.createdAt);
    
    return NextResponse.json({ 
      success: true,
      data: allDonations
    });
    
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch donations" 
    }, { status: 500 });
  }
}