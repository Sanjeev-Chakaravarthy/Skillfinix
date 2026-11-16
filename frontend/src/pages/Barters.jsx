import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  ArrowLeftRight,
  MessageCircle,
  Sparkles,
  Filter,
  X,
  Compass,

} from "lucide-react";
import SkillBarterCard from "@/components/SkillBarterCard";
import { CustomButton } from "@/components/CustomButton";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Barters = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillsToTeach, setSelectedSkillsToTeach] = useState([]);
  const [selectedSkillsToLearn, setSelectedSkillsToLearn] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'teach' | 'learn'

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");

  const [allTeachSkills, setAllTeachSkills] = useState([]);
  const [allLearnSkills, setAllLearnSkills] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/barters");
        setUsers(data);

        const teach = [...new Set(data.flatMap((u) => u.skills || []))];
        const learn = [...new Set(data.flatMap((u) => u.interests || []))];
        setAllTeachSkills(teach);
        setAllLearnSkills(learn);
      } catch (error) {
        console.error("Failed to fetch barter users", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  // Filter Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.skills || []).some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (user.interests || []).some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTeach =
      selectedSkillsToTeach.length === 0 ||
      selectedSkillsToTeach.some((skill) => (user.skills || []).includes(skill));

    const matchesLearn =
      selectedSkillsToLearn.length === 0 ||
      selectedSkillsToLearn.some((skill) => (user.interests || []).includes(skill));

    return matchesSearch && matchesTeach && matchesLearn;
  });

  const handleMessage = (user) => {
    try {
      navigate("/skill-chat", {
        state: { selectedUserId: user._id, selectedUserData: user },
      });
      toast({
        title: "Opening Chat",
        description: `Starting conversation with ${user.name}`,
      });
    } catch (error) {
      console.error("Error opening chat:", error);
      toast({
        title: "Error",
        description: "Failed to open chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConnect = (user) => {
    setSelectedUser(user);
    setMessageText(
      `Hi ${user.name}! I'd love to exchange skills with you. ${
        user.interests?.length > 0 ? `I can teach ${user.interests[0]}` : ""
      } ${
        user.skills?.length > 0 ? `and I'm interested in learning ${user.skills[0]}` : ""
      }. Let's connect!`
    );
    setShowModal(true);
  };

  const handleConfirmConnect = async () => {
    if (!selectedUser || !messageText.trim()) {
      toast({
        title: "Error",
        description: "Please write a message",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/messages", {
        receiverId: selectedUser._id,
        text: messageText.trim(),
      });

      toast({
        title: "Request Sent!",
        description: `Your message has been sent to ${selectedUser.name}`,
      });

      setShowModal(false);
      setSelectedUser(null);
      setMessageText("");

      navigate("/skill-chat", {
        state: { selectedUserId: selectedUser._id, selectedUserData: selectedUser },
      });
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleFilter = (skill, type) => {
    if (type === "teach") {
      setSelectedSkillsToTeach((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
      );
    } else {
      setSelectedSkillsToLearn((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
      );
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSkillsToTeach([]);
    setSelectedSkillsToLearn([]);
  };

  const hasActiveFilters =
    searchQuery || selectedSkillsToTeach.length > 0 || selectedSkillsToLearn.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 rounded-full animate-spin border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading barter community…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* ── Top Hero Banner ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-5 rounded-3xl py-6 px-6 sm:px-8 relative overflow-hidden text-white"
        style={{
          background: "var(--gradient-hero)",
          boxShadow: "0 16px 40px hsl(238 84% 60% / 0.20)",
        }}
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-white mb-2.5 border border-white/20">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Peer Skill Exchange Marketplace
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight mb-2">
            Trade What You Know. Learn Free.
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl leading-relaxed mb-4">
            Directly barter real-world expertise with fellow builders, designers, and domain experts around the globe.
          </p>

          {/* Quick Metrics Strip */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-3 border-t border-white/20 text-xs font-medium">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-display text-white">
                {users.length}
              </div>
              <div className="text-white/70 text-[11px]">Verified Exchangers</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-display text-white">
                {allTeachSkills.length}
              </div>
              <div className="text-white/70 text-[11px]">Skills Cataloged</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-display text-white">
                {filteredUsers.length}
              </div>
              <div className="text-white/70 text-[11px]">Matches Available</div>
            </div>
          </div>
        </div>

        {/* Ambient subtle light orb */}
        <div
          className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* ── Search & Sleek Pill Filter Bar ──────────────────────────────── */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, skill to learn, or skill to teach..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md self-start sm:self-auto shrink-0">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Skills
            </button>
            <button
              onClick={() => setActiveTab("teach")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                activeTab === "teach"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Offers ({allTeachSkills.length})
            </button>
            <button
              onClick={() => setActiveTab("learn")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                activeTab === "learn"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Wants ({allLearnSkills.length})
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Horizontal Pill Filters */}
        {(activeTab === "all" || activeTab === "teach") && allTeachSkills.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Filter by offered skills
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {allTeachSkills.slice(0, 16).map((skill) => {
                const isSelected = selectedSkillsToTeach.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleFilter(skill, "teach")}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer",
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20"
                    )}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(activeTab === "all" || activeTab === "learn") && allLearnSkills.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Filter by wanted skills
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {allLearnSkills.slice(0, 16).map((skill) => {
                const isSelected = selectedSkillsToLearn.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleFilter(skill, "learn")}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer",
                      isSelected
                        ? "bg-sky-600 text-white shadow-xs ring-2 ring-sky-500/30"
                        : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 hover:bg-sky-500/20"
                    )}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── User Cards Grid ────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing <span className="font-bold text-foreground">{filteredUsers.length}</span>{" "}
          matched barter partners
        </span>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-border/80 bg-card p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-heading text-foreground mb-1">
            No barter matches found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
            Try adjusting your search criteria or clear your active skill filters.
          </p>
          <CustomButton variant="outline" onClick={clearAllFilters}>
            Clear All Filters
          </CustomButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.4) }}
            >
              <SkillBarterCard
                user={user}
                onConnect={() => handleConnect(user)}
                onMessage={() => handleMessage(user)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Connect Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Send Barter Request"
        description="Agree on skills to trade and start your first learning session."
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-xs font-semibold text-muted-foreground">
              Your message
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full h-32 p-3 text-sm transition-colors border resize-none bg-background border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Hi! I would love to exchange skills with you..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <CustomButton variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="gradient" onClick={handleConfirmConnect}>
              Send Request
            </CustomButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Barters;
