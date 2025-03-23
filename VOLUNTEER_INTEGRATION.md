# Volunteer Section Supabase Integration Guide

This guide outlines the steps to integrate the volunteer section of the Samarthanam Trust Volunteer Management System with Supabase, similar to what was done with the admin section.

## Database Schema Overview

Based on the diagram, the key tables for volunteer functionality are:

- `volunteer`: Stores volunteer user information
- `event_signup`: Tracks event registrations from volunteers
- `task_assignment`: Manages task assignments to volunteers
- `task`: Stores task information
- `event`: Stores event information
- `feedback`: Optional table for volunteer feedback

## Implementation Steps

### 1. Create Required Tables (If Not Existing)

If any required tables are missing in your Supabase instance, run the SQL script located at:
`src/db/create-volunteer-tables.sql`

This script creates all necessary tables with appropriate relationships.

### 2. Updated Components

The following components have been updated to integrate with Supabase:

- `VolunteerDashboard.tsx`: Shows volunteer stats, upcoming events, tasks, badges
- `VolunteerEvents.tsx`: Lists events the volunteer has registered for
- `TasksPage.tsx`: Shows tasks assigned to the volunteer
- `VolunteerTaskDetails.tsx`: Detailed view of a task with completion controls

### 3. New Database Functions

The following functions have been added to `database.service.ts`:

- `getVolunteerEvents`: Fetches events a volunteer has signed up for
- `getTasksForVolunteer`: Fetches tasks assigned to a volunteer
- `getVolunteerBadges`: Fetches badges earned by a volunteer
- `getVolunteerStats`: Fetches volunteer statistics (events, hours, etc.)
- `getTaskById`: Fetches details for a specific task
- `submitTaskFeedback`: Submits feedback for a completed task
- `registerVolunteerForEvent`: Registers a volunteer for an event
- `cancelEventRegistration`: Cancels a volunteer's event registration
- `checkEventRegistration`: Checks if a volunteer is registered for an event

### 4. Authentication Integration

The volunteer section uses the existing authentication context (`authContext.tsx`) and services (`auth.service.ts`), with the only difference being the role is 'volunteer' instead of 'admin'.

## Testing the Integration

1. **Login as a Volunteer**:
   - Use a volunteer account to log in
   - Verify the dashboard loads with the volunteer's data

2. **View and Register for Events**:
   - Check that the events page shows available events
   - Test event registration functionality

3. **Manage Tasks**:
   - View assigned tasks
   - Test updating task status (start, complete)
   - Test submitting feedback for completed tasks

## Troubleshooting

### Common Issues

1. **Missing Data**: If tables don't exist or are empty, you'll need to create them using the SQL script.

2. **Authentication Issues**: Ensure the volunteer account exists in the `volunteer` table and has a matching auth user.

3. **Foreign Key Constraints**: If you get foreign key constraint errors, ensure that referenced records exist (e.g., event_id must exist in the event table).

### Database Queries

To verify your data is correct, you can run these queries in the Supabase SQL Editor:

```sql
-- Check volunteer registrations
SELECT * FROM event_signup WHERE volunteer_id = '[VOLUNTEER_ID]';

-- Check assigned tasks
SELECT t.*, e.title as event_title 
FROM task t
JOIN task_assignment ta ON t.id = ta.task_id
JOIN event e ON t.event_id = e.id
WHERE ta.volunteer_id = '[VOLUNTEER_ID]';

-- Check volunteer profile data
SELECT * FROM volunteer WHERE id = '[VOLUNTEER_ID]';
```

## Next Steps

1. **Implement Event Feedback**: Allow volunteers to provide feedback after events.

2. **Add Badge Automation**: Automate awarding badges based on volunteer activity.

3. **Volunteer Leaderboard**: Implement a leaderboard based on hours/events completed.

4. **Notifications**: Add real-time notifications for new task assignments or event updates.

## Security Considerations

- Row Level Security (RLS) policies have been included in the SQL script to ensure volunteers can only access their own data.
- Make sure to test these policies to ensure data segregation is working correctly.

## Contact

If you encounter any issues with the integration, please contact the development team. 