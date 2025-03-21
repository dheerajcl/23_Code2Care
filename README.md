# Samarthanam Trust Volunteer Management System

This is a volunteer management system for Samarthanam Trust for the Disabled, a National Award-winning NGO that works for the empowerment of persons with disabilities and the underserved through diverse initiatives.

## Features

- **Admin Features**:
  - Create and schedule events
  - Create tasks for events and schedule tasks
  - Identify potential volunteers based on skills and interests
  - Notify volunteers of opportunities
  - Assign tasks to volunteers
  - Track task status
  - Collect feedback from volunteers

- **Volunteer Features**:
  - Register with email, skills, interests, and availability preferences
  - View recommended events and all available events
  - Register for events
  - Accept tasks and provide updates
  - Submit feedback after events
  - Receive notifications of new events

## Technology Stack

- Frontend: React with Vite, TypeScript, Tailwind CSS, shadcn/ui
- Authentication: Supabase Auth + Prisma
- Database: PostgreSQL
- ORM: Prisma
- State Management: React Context API

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm package manager
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/samarthanam.git
   cd samarthanam
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Configure environment variables by copying the `.env.example` to `.env` and updating the values:
   ```
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   - `DATABASE_URL`: PostgreSQL connection string
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

4. Set up the database with Prisma:
   ```
   pnpm dlx prisma migrate dev --name init
   ```

5. Start the development server:
   ```
   pnpm dev
   ```

## Database Setup

The project uses Prisma ORM to connect to a PostgreSQL database. The schema is defined in `prisma/schema.prisma`.

### Setting up PostgreSQL

1. Install PostgreSQL on your machine or use a cloud-hosted PostgreSQL database
2. Create a new database for the project:
   ```sql
   CREATE DATABASE samarthanam;
   ```

3. Update the `DATABASE_URL` in your `.env` file to point to your PostgreSQL instance:
   ```
   DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/samarthanam?schema=public"
   ```

4. Run Prisma migrations to set up your database schema:
   ```
   pnpm dlx prisma migrate dev --name init
   ```

### Schema Overview

The database schema includes the following models:
- Admin: Organization administrators
- Volunteer: People who sign up to volunteer
- Organization: Organizations that coordinate volunteer events
- Event: Volunteer events organized by admins
- Task: Individual tasks within events
- EventSignup: Volunteer event registrations
- TaskAssignment: Task assignments to volunteers
- Feedback: Volunteer feedback on events

## Authentication

The application uses Supabase for authentication, combined with Prisma for user data storage. This approach provides:

1. Email-based authentication
2. Role-based access control (Admin vs Volunteer)
3. Secure password hashing

## Accessibility

The platform is designed to be accessible, especially for visually impaired users, with features like:
- Keyboard navigation
- Screen reader compatibility
- High contrast mode
- Text-to-speech capabilities
- Scalable font sizes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
