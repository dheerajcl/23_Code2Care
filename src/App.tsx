import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/lib/authContext";
import ProtectedRoute from "@/components/ProtectedRoute";

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
import DonationPage from "./pages/Donate"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<Events />} />
              <Route path="/about" element={<About />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/join-us" element={<JoinUs />} />
              <Route path="/participant" element={<ParticipantForm/>}/>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/donate" element={<DonationPage/>} />
              {/* <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/volunteers" element={<AdminVolunteers />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/events/:id" element={<AdminEventDetails />} />
              <Route path="/admin/reports" element={<AdminReports />} /> */}


              
              {/* Protected admin routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Protected admin routes */}
              <Route 
                path="/admin/events" 
                element={
                  <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                    <AdminEvents />
                  </ProtectedRoute>
                } 
              />

              {/* Protected admin routes */}
              <Route 
                path="/admin/events/:id" 
                element={
                  <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                    <AdminEventDetails />
                  </ProtectedRoute>
                } 
              />

              {/* Protected admin routes */}
              <Route 
                path="/admin/volunteers" 
                element={
                  <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                    <AdminVolunteers />
                  </ProtectedRoute>
                } 
              />

              {/* Protected admin routes */}
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                    <AdminReports />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected volunteer routes */}
              <Route 
                path="/volunteer/dashboard" 
                element={
                  <ProtectedRoute roles={['volunteer']} redirectTo="/login">
                    <VolunteerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;