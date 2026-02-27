import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  MessageCircle,
  ArrowLeftRight,
  ArrowLeft,
  Calendar,
  AlertCircle,
  BookOpen,
  Zap,
  Home,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { CustomButton } from "@/components/CustomButton";
import { useToast } from "@/components/ui/use-toast";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getDefaultAvatar = (name) => {
  const encoded = encodeURIComponent(name || "U");
  return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&size=200&bold=true&rounded=true`;
};

const getAvatarUrl = (user) => {
  if (user?.avatar && user.avatar.startsWith("http")) return user.avatar;
  if (user?.avatar && user.avatar.startsWith("/")) return `http://localhost:5005${user.avatar}`;
  return getDefaultAvatar(user?.name);
};

const formatJoinDate = (dateString) => {
  if (!dateString) return "Recently";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

const ProfileSkeleton = ({ onBack }) => (
  <div className="max-w-4xl mx-auto px-4 md:px-0 pb-16 pt-6">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit"
    >
      <ArrowLeft className="w-4 h-4" /> Back
    </button>

    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm animate-pulse">
      {/* Header gradient */}
      <div className="h-36 bg-muted/70" />

      <div className="px-6 pb-8">
        <div className="flex flex-col gap-5 -mt-14 sm:flex-row sm:items-end sm:justify-between">
          {/* Avatar + name */}
          <div className="flex items-end gap-5">
            <div className="w-28 h-28 rounded-2xl bg-muted border-4 border-card shadow-md shrink-0" />
            <div className="space-y-3 pb-2">
              <div className="h-7 w-44 bg-muted rounded-lg" />
              <div className="h-4 w-32 bg-muted rounded-md" />
              <div className="h-4 w-24 bg-muted rounded-md" />
            </div>
          </div>
          {/* Buttons */}
          <div className="flex gap-3 pb-2">
            <div className="h-9 w-28 bg-muted rounded-xl" />
            <div className="h-9 w-32 bg-muted rounded-xl" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-16 bg-muted/60 rounded-xl" />
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2 space-y-3">
            <div className="h-5 w-20 bg-muted rounded" />
            <div className="h-28 bg-muted/50 rounded-xl" />
          </div>
          <div className="space-y-3">
            <div className="h-5 w-20 bg-muted rounded" />
            <div className="h-28 bg-muted/50 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── User Not Found ───────────────────────────────────────────────────────────

const UserNotFound = ({ message, onBack, onHome }) => (
  <div className="max-w-4xl mx-auto px-4 md:px-0 pb-16 pt-6">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit"
    >
      <ArrowLeft className="w-4 h-4" /> Go Back
    </button>

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center gap-5 bg-card border border-border rounded-3xl shadow-sm"
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground mb-2">
          {message || "User Not Found"}
        </h2>
        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
          The profile you're looking for doesn't exist, has been removed, or the
          link is invalid.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <CustomButton variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </CustomButton>
        <CustomButton variant="gradient" onClick={onHome}>
          <Home className="w-4 h-4 mr-2" /> Return Home
        </CustomButton>
      </div>
    </motion.div>
  </div>
);

// ─── Stat Pill ────────────────────────────────────────────────────────────────

const StatPill = ({ icon: Icon, label, value, color = "primary" }) => (
  <div
    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-${color}/5 border border-${color}/10 gap-1 min-w-[80px]`}
  >
    <Icon className={`w-4 h-4 text-${color} mb-0.5`} />
    <span className={`text-xl font-bold text-${color} font-heading leading-none`}>
      {value}
    </span>
    <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
  </div>
);

// ─── Tag Cloud ────────────────────────────────────────────────────────────────

const TagCloud = ({ items, colorClass, emptyText }) => (
  <div className="flex flex-wrap gap-2">
    {items?.length > 0 ? (
      items.map((item, i) => (
        <span
          key={i}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${colorClass}`}
        >
          {item}
        </span>
      ))
    ) : (
      <span className="text-sm text-muted-foreground italic">{emptyText}</span>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("[ProfilePage] Fetching profile for id:", id);

    // Guard: invalid id
    if (!id || id === "undefined" || id === "null") {
      setError("Invalid profile link.");
      setLoading(false);
      return;
    }

    // Redirect to own profile page (editable)
    if (
      currentUser &&
      (currentUser._id === id ||
        currentUser._id?.toString() === id ||
        currentUser.id === id)
    ) {
      navigate("/profile", { replace: true });
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/users/${id}`);
        console.log("[ProfilePage] User data received:", data);
        setProfileUser(data);
      } catch (err) {
        console.error("[ProfilePage] Error:", err.response?.status, err.message);
        if (err.response?.status === 404 || err.response?.status === 400) {
          setError("User not found.");
        } else {
          setError("Failed to load profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, currentUser, navigate]);

  const handleMessage = async () => {
    if (!profileUser?._id) return;
    try {
      const { data } = await api.post(`/users/${profileUser._id}/conversation`);
      navigate("/skill-chat", {
        state: {
          selectedUserId: profileUser._id,
          selectedUserData: data.otherUser,
        },
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to start conversation.",
        variant: "destructive",
      });
    }
  };

  const handleSwapRequest = () => {
    navigate("/barters");
  };

  // ── States ──────────────────────────────────────────────────────────────────

  if (loading) return <ProfileSkeleton onBack={() => navigate(-1)} />;

  if (error || !profileUser) {
    return (
      <UserNotFound
        message={error}
        onBack={() => navigate(-1)}
        onHome={() => navigate("/")}
      />
    );
  }

  const avatarUrl = getAvatarUrl(profileUser);
  const skills = profileUser.skills || [];
  const interests = profileUser.interests || [];

  // ── Main Profile ────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0 pb-16 pt-6 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
      >
        {/* ── Hero Gradient Header ─────────────────────────────────────── */}
        <div
          className="h-36 relative"
          style={{
            background: "var(--gradient-hero, linear-gradient(135deg, hsl(238 84% 60%) 0%, hsl(262 83% 58%) 100%))",
            boxShadow: "inset 0 -40px 60px rgba(0,0,0,0.12)",
          }}
        >
          {/* Decorative orb */}
          <div
            className="absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)" }}
          />
          <div
            className="absolute right-24 bottom-0 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)" }}
          />
        </div>

        {/* ── Profile Content ──────────────────────────────────────────── */}
        <div className="px-5 sm:px-8 pb-10">

          {/* Avatar Row + Actions */}
          <div className="flex flex-col gap-5 -mt-14 sm:flex-row sm:items-end sm:justify-between">

            {/* Left: Avatar + Name */}
            <div className="flex flex-wrap sm:flex-nowrap items-end gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={avatarUrl}
                  alt={profileUser.name}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-card shadow-xl bg-muted"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getDefaultAvatar(profileUser.name);
                  }}
                />
                {/* Online dot */}
                <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full shadow-sm" />
              </div>

              {/* Name + Meta */}
              <div className="space-y-1.5 pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground leading-tight">
                  {profileUser.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                    <Briefcase className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {profileUser.role || "Student"}
                  </span>

                  {profileUser.location && profileUser.location !== "Earth" && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {profileUser.location}
                    </span>
                  )}

                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    Joined {formatJoinDate(profileUser.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex gap-3 pt-2 sm:pt-0 sm:pb-2 w-full sm:w-auto">
              <CustomButton
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={handleMessage}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </CustomButton>
              <CustomButton
                variant="gradient"
                className="flex-1 sm:flex-none shadow-lg shadow-primary/20"
                onClick={handleSwapRequest}
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Request Swap
              </CustomButton>
            </div>
          </div>

          {/* ── Stats Row ───────────────────────────────────────────────── */}
          <div className="flex gap-3 mt-8">
            <StatPill
              icon={Star}
              label="Skills"
              value={skills.length || 0}
              color="primary"
            />
            <StatPill
              icon={BookOpen}
              label="Interests"
              value={interests.length || 0}
              color="secondary"
            />
            <StatPill
              icon={Zap}
              label="Swaps"
              value={profileUser.swapCount ?? "—"}
              color="primary"
            />
          </div>

          {/* ── About + Skills ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

            {/* Left: About */}
            <div className="md:col-span-2 space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                  About
                </h3>
                <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap min-h-[80px]">
                  {profileUser.bio || (
                    <span className="italic text-muted-foreground">
                      This user hasn't written a bio yet.
                    </span>
                  )}
                </div>
              </section>

              {/* Can Teach (large view) */}
              {skills.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                    Can Teach
                  </h3>
                  <TagCloud
                    items={skills}
                    colorClass="bg-primary/10 text-primary border-primary/20"
                    emptyText="No skills listed"
                  />
                </section>
              )}
            </div>

            {/* Right: Skills sidebar */}
            <div className="space-y-5">
              {/* Can Teach (sidebar — shown when col-1 view) */}
              {skills.length === 0 && (
                <section className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Can Teach
                  </h3>
                  <TagCloud
                    items={skills}
                    colorClass="bg-primary/10 text-primary border-primary/20"
                    emptyText="No skills listed yet"
                  />
                </section>
              )}

              {/* Wants to Learn */}
              <section className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10">
                <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  Wants to Learn
                </h3>
                <TagCloud
                  items={interests}
                  colorClass="bg-secondary/10 text-secondary border-secondary/20"
                  emptyText="No interests listed yet"
                />
              </section>

              {/* Quick Info Card */}
              <section className="p-5 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Quick Info</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Member since {formatJoinDate(profileUser.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{profileUser.role || "Student"}</span>
                  </div>
                  {profileUser.location && profileUser.location !== "Earth" && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
