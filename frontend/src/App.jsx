import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { SocketProvider } from "@/context/SocketContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// ─── Lazy-loaded Pages (code splitting) ──────────────────────────────────────
const Home          = lazy(() => import("@/pages/Home"));
const SkillHunt     = lazy(() => import("@/pages/SkillHunt"));
const Barters       = lazy(() => import("@/pages/Barters"));
const SkillChat     = lazy(() => import("@/pages/SkillChat"));
const WatchVideo    = lazy(() => import("@/pages/WatchVideo"));
const Profile       = lazy(() => import("@/pages/Profile"));
const Settings      = lazy(() => import("@/pages/Settings"));
const MyCourses     = lazy(() => import("@/pages/MyCourses"));
const History       = lazy(() => import("@/pages/History"));
const Favorites     = lazy(() => import("@/pages/Favorites"));
const WatchLater    = lazy(() => import("@/pages/WatchLater"));
const LikedContent  = lazy(() => import("@/pages/LikedContent"));
const Explore       = lazy(() => import("@/pages/Explore"));
const Trending      = lazy(() => import("@/pages/Trending"));
const StartLearning = lazy(() => import("@/pages/StartLearning"));
const LiveSessions  = lazy(() => import("@/pages/LiveSessions"));
const Support       = lazy(() => import("@/pages/Support"));
const MySwaps       = lazy(() => import("@/pages/MySwaps"));
const Communities   = lazy(() => import("@/pages/Communities"));
const UploadVideo   = lazy(() => import("@/pages/UploadVideo"));
const NotFound      = lazy(() => import("@/pages/NotFound"));
const Login         = lazy(() => import("@/pages/Login"));
const Signup        = lazy(() => import("@/pages/Signup"));

// Separate standalone pages
const Videos        = lazy(() => import("@/pages/Videos"));
const Playlists     = lazy(() => import("@/pages/Playlists"));
const Achievements  = lazy(() => import("@/pages/Achievements"));

// Studio
const StudioLayout    = lazy(() => import("@/Layouts/StudioLayout"));
const StudioDashboard = lazy(() => import("@/pages/studio/Dashboard"));
const StudioContent   = lazy(() => import("@/pages/studio/Content"));

const ProtectedRoute  = lazy(() => import("@/pages/ProtectedRoute"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

// ─── Suspense Fallback ────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// ─── Main App Layout ──────────────────────────────────────────────────────────
const MainLayout = () => {
  const { loading } = useAuth();
  
  // Prevent layout flash on reload
  if (loading) return <div className="h-screen bg-background" />;
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-6 pb-12 relative z-0">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

// ─── Auth Layout (no Navbar/Sidebar) ─────────────────────────────────────────
const AuthLayout = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

// ─── Coming Soon placeholder ──────────────────────────────────────────────────
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-5">
      <span className="text-3xl">🚀</span>
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground">This feature is coming soon. Stay tuned!</p>
  </div>
);

// ─── App Root ─────────────────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <SocketProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />

              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ── Public Auth Routes ─────────────────── */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login"  element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                  </Route>

                  {/* ── Protected Main App Routes ─────────── */}
                  <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="/"           element={<Home />} />
                    <Route path="/skill-hunt" element={<SkillHunt />} />
                    <Route path="/barters"    element={<Barters />} />
                    <Route path="/skill-chat" element={<SkillChat />} />

                    {/* Course Viewing */}
                    <Route path="/watch/:id"   element={<WatchVideo />} />
                    <Route path="/courses/:id" element={<WatchVideo />} />
                    <Route path="/course/:id"  element={<WatchVideo />} />

                    {/* Personal Library — each with a dedicated page */}
                    <Route path="/my-courses"   element={<MyCourses />} />
                    <Route path="/history"      element={<History />} />
                    <Route path="/favorites"    element={<Favorites />} />
                    <Route path="/watch-later"  element={<WatchLater />} />
                    <Route path="/liked"        element={<LikedContent />} />
                    <Route path="/videos"       element={<Videos />} />
                    <Route path="/playlists"    element={<Playlists />} />
                    <Route path="/achievements" element={<Achievements />} />

                    {/* Discovery */}
                    <Route path="/explore"  element={<Explore />} />
                    <Route path="/trending" element={<Trending />} />

                    {/* Feature Routes */}
                    <Route path="/start-learning" element={<StartLearning />} />
                    <Route path="/live-sessions"  element={<LiveSessions />} />
                    <Route path="/support"        element={<Support />} />
                    <Route path="/my-swaps"       element={<MySwaps />} />
                    <Route path="/communities"    element={<Communities />} />

                    {/* Profile & Settings */}
                    <Route path="/profile"  element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/upload"   element={<UploadVideo />} />

                    {/* Redirects for old/renamed routes */}
                    <Route path="/live"    element={<Navigate to="/live-sessions" replace />} />
                    <Route path="/mentors" element={<Navigate to="/barters" replace />} />
                  </Route>

                  {/* ── Creator Studio Routes ──────────────── */}
                  <Route element={<ProtectedRoute><Suspense fallback={<PageLoader />}><StudioLayout /></Suspense></ProtectedRoute>}>
                    <Route path="/studio"              element={<StudioDashboard />} />
                    <Route path="/studio/dashboard"    element={<StudioDashboard />} />
                    <Route path="/studio/content"      element={<StudioContent />} />
                    <Route path="/studio/upload"       element={<UploadVideo />} />
                    <Route path="/studio/analytics"    element={<StudioDashboard />} />
                    <Route path="/studio/comments"     element={<StudioContent />} />
                    <Route path="/studio/settings"     element={<Settings />} />
                  </Route>

                  {/* ── 404 ───────────────────────────────── */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>

            </TooltipProvider>
          </SocketProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
