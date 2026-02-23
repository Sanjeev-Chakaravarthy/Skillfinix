import React, { useState, useEffect } from "react";
import { Loader2, Users, MessageSquare, Plus, ExternalLink, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data } = await api.get('/communities');
      setCommunities(data || []);
    } catch (error) {
      console.error("Community fetch error:", error?.response?.data || error.message);
      toast({ title: "Failed to load communities", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId, currentStatus) => {
    if (!user) {
      toast({ title: "Please sign in to join communities" });
      return;
    }
    try {
      const { data } = await api.put(`/communities/${communityId}/join`);
      toast({ title: data.message });
      // Instant UI update
      setCommunities(prev => prev.map(c => {
        if (c._id === communityId) {
          const members = data.isMember 
            ? [...c.members, { _id: user.id }] 
            : c.members.filter(m => m._id !== user.id);
          return { ...c, members };
        }
        return c;
      }));
    } catch (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Globe2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground">Communities</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Join groups of like-minded learners. Teach, barter, ask questions, and grow together inside dedicated skill hubs.
          </p>
        </div>
        
        <Button className="shrink-0 gap-2 font-medium" onClick={() => toast({ title: "Creating communities coming next!" })}>
          <Plus className="w-4 h-4" /> Create Hub
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {communities.length === 0 ? (
          <div className="col-span-full py-20 border border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Globe2 className="w-12 h-12 opacity-20" />
            No communities built yet. Be the first to start a hub!
          </div>
        ) : (
          communities.map((community, idx) => {
            const isMember = community.members.some(m => m._id === user?.id);
            
            return (
              <motion.div
                key={community._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-card rounded-[24px] border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col overflow-hidden"
              >
                {/* Cover Image height: 160px */}
                <div className="w-full h-32 relative overflow-hidden bg-muted">
                  <img 
                    src={community.coverImage || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"} 
                    alt={community.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Category Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-semibold text-white/90 border border-white/10 uppercase tracking-wider">
                      {community.category}
                    </span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {community.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                    {community.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-border/50 py-4 mt-auto">
                    <div className="flex items-center gap-4 text-sm font-medium text-foreground/80">
                      <div className="flex items-center gap-1.5" title="Members">
                        <Users className="w-4 h-4 text-blue-500" />
                        {community.members.length}
                      </div>
                      <div className="flex items-center gap-1.5" title="Discussions">
                        <MessageSquare className="w-4 h-4 text-green-500" />
                        {community.posts?.length || 0}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                       Created by <span className="font-semibold text-foreground/90">{community.createdBy?.name || "Anonymous"}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant={isMember ? "outline" : "default"} 
                      className={`flex-1 font-semibold ${isMember ? 'opacity-70 hover:opacity-100 hover:text-destructive hover:border-destructive hover:bg-destructive/10' : ''}`}
                      onClick={() => handleJoin(community._id, isMember)}
                    >
                       {isMember ? "Leave Hub" : "Join Hub"}
                    </Button>
                    <Button variant="secondary" size="icon" className="shrink-0" asChild>
                      <Link to={`/communities/${community._id}`}>
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          )
        )}
      </div>
    </div>
  );
};

export default Communities;
