import { WebmasterDashboard } from './pages/WebmasterDashboard';
import { WebmasterEvents } from './pages/WebmasterEvents';
import { WebmasterVolunteers } from './pages/WebmasterVolunteers';
import { WebmasterReports } from './pages/WebmasterReports';
import { WebmasterEventDetails } from './pages/WebmasterEventDetails';
import { WebmasterEventFeedback } from './pages/WebmasterEventFeedback';
import { WebmasterTasks } from './pages/WebmasterTasks';
import { WebmasterFeedback } from './pages/WebmasterFeedback';

export const webmasterRoutes = [
  { path: '/webmaster/dashboard', element: <WebmasterDashboard /> },
  { path: '/webmaster/events', element: <WebmasterEvents /> },
  { path: '/webmaster/events/:id', element: <WebmasterEventDetails /> },
  { path: '/webmaster/events/:id/feedback', element: <WebmasterEventFeedback /> },
  { path: '/webmaster/volunteers', element: <WebmasterVolunteers /> },
  { path: '/webmaster/reports', element: <WebmasterReports /> },
  { path: '/webmaster/tasks', element: <WebmasterTasks /> },
  { path: '/webmaster/feedback', element: <WebmasterFeedback /> },
]; 