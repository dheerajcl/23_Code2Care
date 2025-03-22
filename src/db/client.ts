// This file creates a safe API layer for database operations
// It ensures client-side code will use mocks or API calls instead of direct DB access

import { db } from './index';
import * as schema from './schema';

// Type definitions based on our schema
export type Admin = typeof schema.admins.$inferSelect;
export type Volunteer = typeof schema.volunteers.$inferSelect;
export type Organization = typeof schema.organizations.$inferSelect;
export type Event = typeof schema.events.$inferSelect;

// Helper to check if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Database operations
// These functions handle both client and server environments

/**
 * Get an admin by email
 */
export async function getAdminByEmail(email: string): Promise<Admin | null> {
  if (isBrowser) {
    // In a real app, this would call an API endpoint
    // For now, we'll return mock data based on localStorage
    const mockUserStr = localStorage.getItem('mockUser');
    if (mockUserStr) {
      try {
        const mockUser = JSON.parse(mockUserStr);
        if (mockUser.role === 'admin' && mockUser.email === email) {
          return mockUser as Admin;
        }
      } catch (e) {
        console.error('Failed to parse mock user', e);
      }
    }
    return null;
  } else {
    // Server-side code: use DB directly
    const { eq } = await import('drizzle-orm');
    const result = await db.query.admins.findFirst({
      where: eq(schema.admins.email, email),
    });
    return result;
  }
}

/**
 * Get a volunteer by email
 */
export async function getVolunteerByEmail(email: string): Promise<Volunteer | null> {
  if (isBrowser) {
    // In a real app, this would call an API endpoint
    // For now, we'll return mock data based on localStorage
    const mockUserStr = localStorage.getItem('mockUser');
    if (mockUserStr) {
      try {
        const mockUser = JSON.parse(mockUserStr);
        if (mockUser.role === 'volunteer' && mockUser.email === email) {
          return mockUser as Volunteer;
        }
      } catch (e) {
        console.error('Failed to parse mock user', e);
      }
    }
    return null;
  } else {
    // Server-side code: use DB directly
    const { eq } = await import('drizzle-orm');
    const result = await db.query.volunteers.findFirst({
      where: eq(schema.volunteers.email, email),
    });
    return result;
  }
}

// Add more database operations as needed 