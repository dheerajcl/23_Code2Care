// Browser-safe implementation of database functions
// Uses mock data in localStorage instead of actual database connections

// Mock data for browser environments
const mockData = {
  admins: [
    {
      id: '1',
      email: 'admin@samarthanam.org',
      firstName: 'Admin',
      lastName: 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  volunteers: [
    {
      id: '1',
      email: 'volunteer@example.com',
      firstName: 'Volunteer',
      lastName: 'User',
      phone: '+91 98765 43210',
      city: 'Bengaluru',
      state: 'karnataka',
      skills: ['Teaching', 'Technology'],
      interests: ['Education', 'Community Outreach'],
      availability: 'weekends',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};

// Create a mock DB with the same interface
export const db = {
  query: {
    admins: {
      findFirst: async ({ where }: any) => {
        // Simple mock implementation
        if (where && where._ref && where._ref.name === 'email') {
          const emailToFind = where.value;
          return mockData.admins.find(admin => admin.email === emailToFind) || null;
        }
        return null;
      }
    },
    volunteers: {
      findFirst: async ({ where }: any) => {
        // Simple mock implementation
        if (where && where._ref && where._ref.name === 'email') {
          const emailToFind = where.value;
          return mockData.volunteers.find(vol => vol.email === emailToFind) || null;
        }
        return null;
      }
    }
  },
  
  insert: (table: any) => {
    return {
      values: (data: any) => {
        return {
          returning: async () => {
            // Handle mock inserts
            if (table.name === 'admin') {
              const newAdmin = {
                id: String(mockData.admins.length + 1),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              mockData.admins.push(newAdmin);
              return [newAdmin];
            } else if (table.name === 'volunteer') {
              const newVolunteer = {
                id: String(mockData.volunteers.length + 1),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              mockData.volunteers.push(newVolunteer);
              return [newVolunteer];
            }
            return [{ id: 'mock-id', ...data }];
          }
        };
      }
    };
  }
};

// Helper functions to check for mock users
export function getMockUser() {
  try {
    const mockUserStr = localStorage.getItem('mockUser');
    if (mockUserStr) {
      return JSON.parse(mockUserStr);
    }
  } catch (e) {
    console.error('Failed to parse mock user', e);
  }
  return null;
}

// Export table schemas as needed for API compatibility
export const admins = { name: 'admin' };
export const volunteers = { name: 'volunteer' };

// Mock drizzle-orm functions
export const eq = (field: any, value: any) => {
  return {
    _ref: field,
    value
  };
}; 