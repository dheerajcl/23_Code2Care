import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, AdminAuthProvider, VolunteerAuthProvider, WebmasterAuthProvider } from "@/lib/authContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { VolunteerTasks } from './volunteer/tasks';
import { VolunteerBadges } from './volunteer/badges';
import { VolunteerProgress } from './volunteer/progress';
import { TaskResponse } from './volunteer/TaskResponse';
import EventFeedback from './volunteer/events/feedback';
import AdminEventFeedback from './admin/pages/AdminEventFeedback';
import AdminNotificationDashboard from './admin/components/AdminNotificationDashboard';
import { TalkBackProvider } from './components/TalkBack';
import { ThemeProvider } from 'next-themes';
import LocalStorageCleaner from './components/LocalStorageCleaner';
import AdminParticipants from "@/admin/pages/AdminParticipants";
import RegisterWebmaster from './RegisterWebmaster.tsx';
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VolunteerDataMigration from './admin/pages/VolunteerDataMigration.tsx';
import DonationUpload from './admin/pages/DonationDataMigration.tsx';
import MigratePage from './admin/pages/MigratePage.tsx';
import { CertificatePage } from './pages/Certificate.tsx';
import { WebmasterLogin } from '@/webmaster/pages/WebmasterLogin';
import { WebmasterDashboard } from '@/webmaster/pages/WebmasterDashboard';
import { WebmasterEvents } from '@/webmaster/pages/WebmasterEvents';
import { WebmasterEventDetails } from '@/webmaster/pages/WebmasterEventDetails';
import { WebmasterEventFeedback } from '@/webmaster/pages/WebmasterEventFeedback';
import { WebmasterVolunteers } from '@/webmaster/pages/WebmasterVolunteers';
import { WebmasterReports } from '@/webmaster/pages/WebmasterReports';
import { WebmasterTasks } from '@/webmaster/pages/WebmasterTasks';
import { WebmasterFeedback } from '@/webmaster/pages/WebmasterFeedback';
import AdminNotificationHistory from './admin/components/AdminNotificationHistory.tsx';
// Pages

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
          <BrowserRouter>
            <AdminAuthProvider>
              <VolunteerAuthProvider>
                <WebmasterAuthProvider>
                  <AuthProvider>
                    <TalkBackProvider>
                      <LocalStorageCleaner />
                      <AnimatePresence mode="wait">
                        <Routes>
                          {/* Public routes */}
                          <Route path="/" element={<Index />} />
                          <Route path="/events" element={<Events />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/donate" element={<DonationPage />} />
                          <Route path="/events/:id/participant" element={<ParticipantRegistration />} />
                          <Route path="/events/participant/success" element={<ParticipantRegistrationSuccess />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route path="/join-us" element={<JoinUs />} />
                          <Route path="/participant-form" element={<ParticipantForm />} />
                          <Route path="/auth/callback" element={<AuthCallback />} />
                          
                          {/* Task response route - publicly accessible from email links */}
                          <Route path="/volunteer/task-response" element={<TaskResponse />} />
                          
                          {/* Admin routes */}
                          <Route path="/admin/login" element={<AdminLogin />} />
                          <Route
                            path="/admin/registers"
                            element={
                              <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                                <AdminRegister />
                              </ProtectedRoute>
                            }
                          />
                          {/* <Route
                            path="/admin/webmasterregisters"
                            element={
                              <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                                <RegisterWebmaster />
                              </ProtectedRoute>
                            }
                          /> */}
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
                            path="/admin/participants"
                            element={
                              <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                                <AdminParticipants />
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
                          <Route
                            path="/admin/notifications/history"
                            element={
                              <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                                <AdminNotificationHistory />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                    path="/admin/migration"
                    element={
                      <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                        <MigratePage/>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/migration/volunteerdata"
                    element={
                      <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                        <VolunteerDataMigration/>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/migration/donationdata"
                    element={
                      <ProtectedRoute roles={['admin']} redirectTo="/admin/login">
                        <DonationUpload/>
                      </ProtectedRoute>
                    }/>
                          
                          {/* Webmaster routes */}
                          <Route path="/webmaster" element={<WebmasterLogin />} />
                          <Route path="/webmaster/login" element={<WebmasterLogin />} />
                          <Route
                            path="/webmaster/dashboard"
                            element={
                              <ProtectedRoute roles={['webmaster']} redirectTo="/webmaster/login">
                                <WebmasterDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/webmaster/events"
                            element={
                              <ProtectedRoute roles={['webmaster']} redirectTo="/webmaster/login">
                                <WebmasterEvents />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/webmaster/events/:id"
                            element={
                              <ProtectedRoute roles={['webmaster']} redirectTo="/webmaster/login">
                                <WebmasterEventDetails />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/webmaster/events/:id/feedback"
                            element={
                              <ProtectedRoute roles={['webmaster']} redirectTo="/webmaster/login">
                                <WebmasterEventFeedback />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/webmaster/volunteers"
                            element={
                              <ProtectedRoute roles={['webmaster']} redirectTo="/webmaster/login">
                                <WebmasterVolunteers />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/webmaster/reports"
                            element={
                              <ProtectedRoute roles={['webmaster']} redirectTo="/webmaster/login">
                                <WebmasterReports />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/webmaster/tasks"
                            element={
                              <ProtectedRoute roles={['webmaster']} redirectTo="/webmaster/login">
                                <WebmasterTasks />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/webmaster/feedback"
                            element={
                              <ProtectedRoute roles={['webmaster']} redirectTo="/webmaster/login">
                                <WebmasterFeedback />
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
                            path="/volunteer/events/:id/certificate"
                            element={
                              <ProtectedRoute roles={['volunteer']} redirectTo="/login">
                                <CertificatePage />
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
                      <Toaster />
                      <Sonner />
                    </TalkBackProvider>
                  </AuthProvider>
                </WebmasterAuthProvider>
              </VolunteerAuthProvider>
            </AdminAuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;