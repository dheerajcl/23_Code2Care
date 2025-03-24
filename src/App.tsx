import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/lib/authContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { VolunteerTasks } from './volunteer/tasks';
import { VolunteerBadges } from './volunteer/badges';
import { VolunteerProgress } from './volunteer/progress';
import { TaskResponse } from './volunteer/TaskResponse';
import EventFeedback from './volunteer/events/feedback';
import AdminEventFeedback from './admin/pages/AdminEventFeedback';
import AdminNotificationDashboard from './admin/components/AdminNotificationDashboard';
import { TalkBackProvider } from './components/TalkBack';

// Pages
import Index from "./pages/Index";
import Events from "./pages/Events";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminRegister from "./admin/pages/AdminRegister";
import JoinUs from "./pages/JoinUs";
import ParticipantForm from "./pages/ParticipantForm";
import AdminDashboard from "./admin/pages/AdminDashboard";
import VolunteerDashboard from "./volunteer/VolunteerDashboard";
import AdminEvents from "./admin/pages/AdminEvents";
import AdminVolunteers from "./admin/pages/AdminVolunteers";
import AdminReports from "./admin/pages/AdminReports";
import AuthCallback from "./pages/AuthCallback";
import AdminEventDetails from "./admin/pages/AdminEventDetails";
import DonationPage from "./pages/Donate";
import VolunteerEvents from "./volunteer/VolunteerEvents";
import CreateEvent from "./admin/pages/CreateEvent";
import EditEvent from "./admin/pages/EditEvent";
import VolunteerTaskDetails from "./volunteer/VolunteerTaskDetails";
import CreateTask from "./admin/pages/CreateTask";
import ParticipantRegistration from "./pages/ParticipantRegistration";
import ParticipantRegistrationSuccess from "./pages/ParticipantRegistrationSuccess";

function App() {
const queryClient = new QueryClient();

  return (
  <QueryClientProvider client={queryClient}>
      <AuthProvider>
    <TooltipProvider>
    <TalkBackProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/events" element={<Events />} />
                <Route path="/about" element={<About />} />
                <Route path="/donate" element={<DonationPage />} />
                <Route path="/events/participant" element={<ParticipantRegistration />} />
                <Route path="/events/participant/success" element={<ParticipantRegistrationSuccess />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/join-us" element={<JoinUs />} />
                <Route path="/participant-form" element={<ParticipantForm />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                {/* Task response route - publicly accessible from email links */}
                <Route path="/volunteer/task-response" element={<TaskResponse />} />
                
                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <AdminEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events/create"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <CreateEvent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events/:id/edit"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <EditEvent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events/:id"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <AdminEventDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events/:id/feedback"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <AdminEventFeedback />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events/:id/createtask"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <CreateTask />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/volunteers"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <AdminVolunteers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <AdminNotificationDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Volunteer routes */}
                <Route
                  path="/volunteer/dashboard"
                  element={
                    <ProtectedRoute roles={['volunteer']} redirectTo="/login">
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/events"
                  element={
                    <ProtectedRoute roles={['volunteer']} redirectTo="/login">
                      <VolunteerEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/events/:id/tasks"
                  element={
                    <ProtectedRoute roles={['volunteer']} redirectTo="/login">
                      <VolunteerTaskDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/events/:id/feedback"
                  element={
                    <ProtectedRoute roles={['volunteer']} redirectTo="/login">
                      <EventFeedback />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/tasks"
                  element={
                    <ProtectedRoute roles={['volunteer']} redirectTo="/login">
                      <VolunteerTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/progress"
                  element={
                    <ProtectedRoute roles={['volunteer']} redirectTo="/login">
                      <VolunteerProgress />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/badges"
                  element={
                    <ProtectedRoute roles={['volunteer']} redirectTo="/login">
                      <VolunteerBadges />
                    </ProtectedRoute>
                  }
                />
                
                {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
          </TalkBackProvider>
          <Toaster />
          <Sonner />
    </TooltipProvider>
      </AuthProvider>
  </QueryClientProvider>
);
}

export default App;