import { db } from './index';
import { admins, volunteers, organizations, events, tasks, eventSignups, taskAssignments, feedback, newsletter } from './schema';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Check if we're running in production
const isProduction = process.env.NODE_ENV === 'production';

async function main() {
  console.log('Starting seed process...');
  
  if (isProduction) {
    console.log('Seeding in production environment is not allowed');
    return;
  }
  
  try {
    // Hash passwords for security
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const volunteerPassword = await bcrypt.hash('Volunteer@123', 10);
    
    // Seed organization
    console.log('Seeding organization...');
    const [organization] = await db.insert(organizations).values({
      name: 'Samarthanam Trust',
      mission: 'Empowering people with disabilities through education, employment, and inclusion',
      website: 'https://samarthanam.org',
    }).returning();
    
    console.log('Organization created:', organization);
    
    // Seed admin user
    console.log('Seeding admin user...');
    const [adminUser] = await db.insert(admins).values({
      email: 'admin@samarthanam.org',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      organizationId: organization.id,
    }).returning();
    
    console.log('Admin user created:', adminUser);
    
    // Seed volunteer user
    console.log('Seeding volunteer user...');
    const [volunteerUser] = await db.insert(volunteers).values({
      email: 'volunteer@example.com',
      password: volunteerPassword,
      firstName: 'Volunteer',
      lastName: 'User',
      phone: '+91 98765 43210',
      city: 'Bengaluru',
      state: 'Karnataka',
      skills: ['Teaching', 'Technology'],
      interests: ['Education', 'Community Outreach'],
      availability: 'Weekends',
    }).returning();
    
    console.log('Volunteer user created:', volunteerUser);
    
    // Seed an event
    console.log('Seeding event...');
    const [event] = await db.insert(events).values({
      title: 'Tech Workshop for Visually Impaired',
      description: 'A workshop teaching basic computer skills to visually impaired individuals',
      location: 'Samarthanam Bangalore Center',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      status: 'upcoming',
      adminId: adminUser.id,
      organizationId: organization.id,
    }).returning();
    
    console.log('Event created:', event);
    
    // Seed a task
    console.log('Seeding task...');
    const [task] = await db.insert(tasks).values({
      title: 'Setup Computers',
      description: 'Setup and configure computers with screen readers for the workshop',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // 2 hours before event
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000), // 1 hour before event
      skills: ['Technology', 'IT Support'],
      maxVolunteers: 2,
      status: 'open',
      eventId: event.id,
    }).returning();
    
    console.log('Task created:', task);
    
    // Seed event signup
    console.log('Seeding event signup...');
    const [signup] = await db.insert(eventSignups).values({
      status: 'confirmed',
      volunteerId: volunteerUser.id,
      eventId: event.id,
    }).returning();
    
    console.log('Event signup created:', signup);
    
    // Seed task assignment
    console.log('Seeding task assignment...');
    const [assignment] = await db.insert(taskAssignments).values({
      status: 'assigned',
      notes: 'Please arrive 30 minutes early',
      volunteerId: volunteerUser.id,
      taskId: task.id,
    }).returning();
    
    console.log('Task assignment created:', assignment);
    
    // Seed newsletter subscribers
    console.log('Seeding newsletter subscriber...');
    await db.insert(newsletter).values({
      email: 'newsletter@example.com',
    }).returning();
    
    console.log('Newsletter subscriber created');
    
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seed process:', error);
    process.exit(1);
  }
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Uncaught error in seed script:', error);
    process.exit(1);
  }); 