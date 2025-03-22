import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/lib/authContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { VolunteerEvents } from './volunteer/events';
import { VolunteerTasks } from './volunteer/tasks';
import { VolunteerBadges } from './volunteer/badges';
import { VolunteerProgress } from './volunteer/progress';

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
import VolunteerDashboard from "./volunteer/dashboard";
import AdminEvents from "./admin/pages/AdminEvents";
import AdminVolunteers from "./admin/pages/AdminVolunteers";
import AdminReports from "./admin/pages/AdminReports";
import AuthCallback from "./pages/AuthCallback";
import AdminEventDetails from "./admin/pages/AdminEventDetails";
import DonationPage from "./pages/Donate";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/events" element={<Events />} />
                <Route path="/about" element={<About />} />
                <Route path="/donate" element={<DonationPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/join-us" element={<JoinUs />} />
                <Route path="/participant-form" element={<ParticipantForm />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                
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
                  path="/admin/events/:id"
                  element={
                    <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                      <AdminEventDetails />
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
                
                {/* Volunteer routes */}
                <Route
                  path="/volunteer/dashboard"
                  element={
                    <ProtectedRoute roles={['volunteer']} redirectTo="/login">
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/volunteer/events" element={<ProtectedRoute><VolunteerEvents /></ProtectedRoute>} />
                <Route path="/volunteer/tasks" element={<ProtectedRoute><VolunteerTasks /></ProtectedRoute>} />
                <Route path="/volunteer/badges" element={<ProtectedRoute><VolunteerBadges /></ProtectedRoute>} />
                <Route path="/volunteer/progress" element={<ProtectedRoute><VolunteerProgress /></ProtectedRoute>} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;