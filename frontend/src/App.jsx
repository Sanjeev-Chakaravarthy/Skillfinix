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
import History from "@/pages/History";
import Favorites from "@/pages/Favorites";
import WatchLater from "@/pages/WatchLater";
import LikedContent from "@/pages/LikedContent";
import Explore from "@/pages/Explore";
import Trending from "@/pages/Trending";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ProtectedRoute from "@/pages/ProtectedRoute";

// New Pages
import StartLearning from "@/pages/StartLearning";
import LiveSessions from "@/pages/LiveSessions";
import Support from "@/pages/Support";
import MySwaps from "@/pages/MySwaps";

// Studio Pages
import StudioLayout from "@/Layouts/StudioLayout";
import StudioDashboard from "@/pages/studio/Dashboard";
import StudioContent from "@/pages/studio/Content";

const queryClient = new QueryClient();

// Layout Component
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex pt-0">
        <Sidebar />
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

// Simple placeholder page component
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-5">
      <span className="text-3xl">🚀</span>
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground">This feature is coming soon. Stay tuned!</p>
  </div>
);

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

                {/* Protected Main App Routes */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route path="/" element={<Home />} />
                  <Route path="/skill-hunt" element={<SkillHunt />} />
                  <Route path="/barters" element={<Barters />} />
                  <Route path="/skill-chat" element={<SkillChat />} />
                  
                  {/* Course Viewing */}
                  <Route path="/watch/:id" element={<WatchVideo />} />
                  <Route path="/courses/:id" element={<WatchVideo />} />
                  <Route path="/course/:id" element={<WatchVideo />} />

                  {/* Personal Library */}
                  <Route path="/my-courses" element={<MyCourses />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/watch-later" element={<WatchLater />} />
                  <Route path="/liked" element={<LikedContent />} />
                  <Route path="/playlists" element={<MyCourses />} />
                  <Route path="/achievements" element={<MyCourses />} />
                  <Route path="/videos" element={<MyCourses />} />

                  {/* Discovery */}
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/trending" element={<Trending />} />
                  
                  {/* New Feature Routes */}
                  <Route path="/start-learning" element={<StartLearning />} />
                  <Route path="/live-sessions" element={<LiveSessions />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/my-swaps" element={<MySwaps />} />
                  <Route path="/communities" element={<ComingSoon title="Communities" />} />

                  {/* Redirect old routes */}
                  <Route path="/live" element={<Navigate to="/live-sessions" replace />} />
                  <Route path="/mentors" element={<Navigate to="/barters" replace />} />

                  {/* User Profile */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/upload" element={<UploadVideo />} />
                </Route>

                {/* Creator Studio Routes */}
                <Route element={<ProtectedRoute><StudioLayout /></ProtectedRoute>}>
                  <Route path="/studio" element={<StudioDashboard />} />
                  <Route path="/studio/dashboard" element={<StudioDashboard />} />
                  <Route path="/studio/content" element={<StudioContent />} />
                  <Route path="/studio/upload" element={<UploadVideo />} />
                  <Route path="/studio/analytics" element={<StudioDashboard />} />
                  <Route path="/studio/comments" element={<StudioContent />} />
                  <Route path="/studio/settings" element={<Settings />} />
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
