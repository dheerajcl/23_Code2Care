// @ts-check
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // Create default organization
  const organization = await prisma.organization.upsert({
    where: { name: 'Samarthanam Trust' },
    update: {},
    create: {
      name: 'Samarthanam Trust',
      mission: 'Empowering the disabled through education, employment, and inclusion',
      website: 'https://www.samarthanam.org'
    },
  });

  console.log('Created organization:', organization.name);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@samarthanam.org' },
    update: {},
    create: {
      email: 'admin@samarthanam.org',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      organizationId: organization.id
    },
  });

  console.log('Created admin user:', admin.email);

  // Create volunteer user
  const volunteerPassword = await bcrypt.hash('Volunteer@123', 10);
  const volunteer = await prisma.volunteer.upsert({
    where: { email: 'volunteer@example.com' },
    update: {},
    create: {
      email: 'volunteer@example.com',
      password: volunteerPassword,
      firstName: 'Volunteer',
      lastName: 'User',
      phone: '+91 98765 43210',
      city: 'Bengaluru',
      state: 'karnataka',
      skills: ['Teaching', 'Technology'],
      interests: ['Education', 'Community Outreach'],
      availability: 'weekends'
    },
  });

  console.log('Created volunteer user:', volunteer.email);

  // Create upcoming event
  const upcomingEvent = await prisma.event.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      title: 'Digital Literacy Workshop',
      description: 'A workshop to teach basic computer skills to visually impaired individuals',
      location: 'Samarthanam Trust HQ, Bengaluru',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      status: 'upcoming',
      adminId: admin.id,
      organizationId: organization.id
    },
  });

  console.log('Created event:', upcomingEvent.title);

  // Create tasks for the event
  const task1 = await prisma.task.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      title: 'Setup equipment',
      description: 'Setup computers and assistive technology devices',
      startTime: new Date(upcomingEvent.startDate.getTime() - 60 * 60 * 1000), // 1 hour before event
      endTime: new Date(upcomingEvent.startDate.getTime()),
      maxVolunteers: 3,
      skills: ['Technology'],
      eventId: upcomingEvent.id
    },
  });

  const task2 = await prisma.task.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      title: 'Teaching assistance',
      description: 'Help participants with hands-on exercises',
      startTime: new Date(upcomingEvent.startDate.getTime()),
      endTime: new Date(upcomingEvent.endDate.getTime()),
      maxVolunteers: 5,
      skills: ['Teaching', 'Technology'],
      eventId: upcomingEvent.id
    },
  });

  console.log('Created tasks for the event');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 