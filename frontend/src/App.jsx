import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { SocketProvider } from "@/context/SocketContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

// Pages
import Home from "@/pages/Home";
import SkillHunt from "@/pages/SkillHunt";
import Barters from "@/pages/Barters";
import SkillChat from "@/pages/SkillChat";
import UploadVideo from "@/pages/UploadVideo";
import WatchVideo from "@/pages/WatchVideo";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import MyCourses from "@/pages/MyCourses";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ProtectedRoute from "@/pages/ProtectedRoute";

const queryClient = new QueryClient();

// Layout Component
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex pt-0">
        <Sidebar className="hidden lg:block w-64 fixed h-[calc(100vh-4rem)] top-16 left-0 border-r border-border bg-card/50 backdrop-blur-xl" />
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)] px-4 lg:px-6 pb-6 pt-4 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Auth Layout (Login/Signup - No Navbar/Sidebar)
const AuthLayout = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <SocketProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              
              <Routes>
                {/* Public Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>

                {/* Protected App Routes */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route path="/" element={<Home />} />
                  <Route path="/skill-hunt" element={<SkillHunt />} />
                  <Route path="/barters" element={<Barters />} />
                  <Route path="/skill-chat" element={<SkillChat />} />
                  <Route path="/upload" element={<UploadVideo />} />
                  <Route path="/watch/:id" element={<WatchVideo />} />
                  <Route path="/course/:id" element={<WatchVideo />} />
                  <Route path="/my-courses" element={<MyCourses />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            
            </TooltipProvider>
          </SocketProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
