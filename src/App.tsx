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
import AdminLogin from "./admin/AdminLogin";
import AdminRegister from "./admin/AdminRegister";
import JoinUs from "./pages/JoinUs";
import AdminDashboard from "./admin/AdminDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";

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
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              
              {/* Protected admin routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                    <AdminDashboard />
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
