import React, { useState, useEffect } from "react";
import { Search, Users, ArrowLeftRight, MessageCircle } from "lucide-react";
import SkillBarterCard from "@/components/SkillBarterCard";
import { CustomButton } from "@/components/CustomButton";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
  
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");

  // Dynamic filter options based on real data
  const [allTeachSkills, setAllTeachSkills] = useState([]);
  const [allLearnSkills, setAllLearnSkills] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users/barters');
        setUsers(data);

        // Extract unique skills for filter buttons
        const teach = [...new Set(data.flatMap(u => u.skills || []))];
        const learn = [...new Set(data.flatMap(u => u.interests || []))];
        setAllTeachSkills(teach);
        setAllLearnSkills(learn);
      } catch (error) {
        console.error("Failed to fetch barter users", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTeach =
      selectedSkillsToTeach.length === 0 ||
      selectedSkillsToTeach.some((skill) => (user.skills || []).includes(skill));

    const matchesLearn =
      selectedSkillsToLearn.length === 0 ||
      selectedSkillsToLearn.some((skill) => (user.interests || []).includes(skill));

    return matchesSearch && matchesTeach && matchesLearn;
  });

  // Handle Message - Redirect to chat
  const handleMessage = (user) => {
    try {
      navigate('/skill-chat', { 
        state: { selectedUserId: user._id, selectedUserData: user } 
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
        variant: "destructive"
      });
    }
  };

  // Handle Connect - Show modal for formal connection request
  const handleConnect = (user) => {
    setSelectedUser(user);
    setMessageText(`Hi ${user.name}! I'd love to exchange skills with you. ${user.interests?.length > 0 ? `I can teach ${user.interests[0]}` : ''} ${user.skills?.length > 0 ? `and I'm interested in learning ${user.skills[0]}` : ''}. Let's connect!`);
    setShowModal(true);
  };

  const handleConfirmConnect = async () => {
    if (!selectedUser || !messageText.trim()) {
      toast({
        title: "Error",
        description: "Please write a message",
        variant: "destructive"
      });
      return;
    }

    try {
      // Send the connection request as a chat message
      await api.post('/chat/messages', {
        receiverId: selectedUser._id,
        text: messageText.trim()
      });

      toast({
        title: "Request Sent!",
        description: `Your message has been sent to ${selectedUser.name}`,
      });

      setShowModal(false);
      setSelectedUser(null);
      setMessageText("");

      // Optionally navigate to chat
      navigate('/skill-chat', { 
        state: { selectedUserId: selectedUser._id, selectedUserData: selectedUser } 
      });
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleFilter = (skill, type) => {
    if (type === "teach") {
      setSelectedSkillsToTeach(prev => 
        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      );
    } else {
      setSelectedSkillsToLearn(prev => 
        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 rounded-full animate-spin border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex items-center gap-3 text-2xl font-bold md:text-3xl font-heading text-foreground"
        >
          <ArrowLeftRight className="w-8 h-8 text-primary" />
          Skill Barters
        </motion.h1>
        <p className="mt-1 text-muted-foreground">
          Exchange skills with talented people around the world
        </p>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <div className="flex items-center gap-4 p-5 border bg-card rounded-2xl border-border">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{users.length}</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 border bg-card rounded-2xl border-border">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10">
            <MessageCircle className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{allTeachSkills.length}</div>
            <div className="text-sm text-muted-foreground">Skills Available</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 border bg-card rounded-2xl border-border">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/50">
            <ArrowLeftRight className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {filteredUsers.length}
            </div>
            <div className="text-sm text-muted-foreground">Matches Found</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }} 
        className="p-5 mb-8 border bg-card rounded-2xl border-border"
      >
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or skill..."
            className="w-full h-12 pl-12 pr-4 transition-all border outline-none bg-muted/50 border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Dynamic Filters */}
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Find people who can teach:
            </label>
            <div className="flex flex-wrap gap-2">
              {allTeachSkills.length > 0 ? (
                allTeachSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleFilter(skill, "teach")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      selectedSkillsToTeach.includes(skill) 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {skill}
                  </button>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No skills listed yet.
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Find people who want to learn:
            </label>
            <div className="flex flex-wrap gap-2">
              {allLearnSkills.length > 0 ? (
                allLearnSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleFilter(skill, "learn")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      selectedSkillsToLearn.includes(skill) 
                        ? "bg-secondary text-secondary-foreground" 
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {skill}
                  </button>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No interests listed yet.
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Found <span className="font-medium text-foreground">{filteredUsers.length}</span> matches
        </p>
      </div>

      {/* User Grid */}
      {filteredUsers.length === 0 ? (
        <div className="py-16 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-muted">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">No matches found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or update your own profile.
          </p>
          <Link to="/profile" className="inline-block mt-4">
            <CustomButton variant="outline">Update Profile</CustomButton>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user, index) => (
            <motion.div 
              key={user._id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }}
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
        description="Let them know what skills you'd like to exchange"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">
              Your message
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full h-32 p-3 transition-all border resize-none bg-muted/50 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Hi! I'd love to exchange skills with you..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <CustomButton 
              variant="outline" 
              onClick={() => setShowModal(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton 
              variant="gradient" 
              onClick={handleConfirmConnect}
            >
              Send Request
            </CustomButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Barters;