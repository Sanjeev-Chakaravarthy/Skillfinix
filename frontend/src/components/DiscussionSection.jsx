import React, { useState, useEffect } from "react";
import { Send, Heart, Reply, MessageSquare, Loader2 } from "lucide-react";
import { CustomButton } from "./CustomButton";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";

const DiscussionSection = ({ courseId }) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const fetchDiscussions = async () => {
      try {
        const { data } = await api.get(`/discussions/${courseId}`);
        setDiscussions(data || []);
      } catch (err) {
        console.error("Failed to fetch discussions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscussions();
  }, [courseId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/discussions/${courseId}`, { text: newComment });
      setDiscussions(prev => [data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (discussionId) => {
    if (!replyText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/discussions/${discussionId}/reply`, { text: replyText });
      setDiscussions(prev => prev.map(d => d._id === discussionId ? data : d));
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (discussionId) => {
    try {
      const { data } = await api.put(`/discussions/${discussionId}/like`);
      setDiscussions(prev => prev.map(d => d._id === discussionId ? data : d));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 mt-6">
      <h3 className="text-xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        Discussions
        <span className="text-sm font-normal text-muted-foreground ml-2">
          {discussions.length} comments
        </span>
      </h3>

      {/* Input box */}
      <form onSubmit={handlePostComment} className="flex gap-4 mb-8">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name?.charAt(0) || 'U'}&background=6366f1&color=fff`}
          alt="Your avatar"
          className="w-10 h-10 rounded-full object-cover shrink-0 mt-1"
        />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Start a discussion or ask a question..."
            disabled={submitting}
            className="w-full bg-transparent border-b border-border border-x-0 border-t-0 ring-0 focus:ring-0 focus:border-primary resize-none p-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground"
            rows={1}
            onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          />
          {newComment.trim().length > 0 && (
            <div className="flex justify-end gap-2 mt-3 animate-in fade-in">
              <CustomButton size="sm" variant="ghost" type="button" onClick={() => setNewComment("")} className="rounded-full">
                Cancel
              </CustomButton>
              <CustomButton size="sm" type="submit" disabled={submitting} className="rounded-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Comment"}
              </CustomButton>
            </div>
          )}
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-6 opacity-60"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
             <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/30 mb-3" />
             <p className="text-muted-foreground text-sm font-medium">No discussions yet</p>
             <p className="text-xs text-muted-foreground/70 mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          discussions.map(d => (
            <div key={d._id} className="flex gap-4">
              <img
                src={d.user?.avatar || `https://ui-avatars.com/api/?name=${d.user?.name?.charAt(0) || 'U'}&background=6366f1&color=fff`}
                alt={d.user?.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{d.user?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mt-1.5 whitespace-pre-wrap">{d.text}</p>
                
                {/* Actions */}
                <div className="flex items-center gap-4 mt-2">
                  <button 
                    onClick={() => toggleLike(d._id)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${d.likes?.includes(user?.id) ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${d.likes?.includes(user?.id) ? "fill-current" : ""}`} />
                    {d.likes?.length || 0}
                  </button>
                  <button 
                    onClick={() => { setReplyingTo(replyingTo === d._id ? null : d._id); setReplyText(""); }}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    Reply
                  </button>
                </div>

                {/* Reply Input */}
                {replyingTo === d._id && (
                  <div className="flex gap-3 mt-4 animate-in slide-in-from-top-2">
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name?.charAt(0) || 'U'}&background=6366f1&color=fff`}
                      alt="Your avatar"
                      className="w-6 h-6 rounded-full object-cover shrink-0 mt-1"
                    />
                    <div className="flex-1 flex flex-col items-end">
                      <textarea
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Add a reply..."
                        disabled={submitting}
                        className="w-full bg-transparent border-b border-border border-x-0 border-t-0 p-1 text-sm focus:ring-0 focus:border-primary resize-none placeholder:text-muted-foreground"
                        rows={1}
                        onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <CustomButton size="sm" variant="ghost" className="h-7 text-xs rounded-full px-3" onClick={() => setReplyingTo(null)}>Cancel</CustomButton>
                        <CustomButton size="sm" className="h-7 text-xs rounded-full px-4" disabled={!replyText.trim() || submitting} onClick={() => handleReply(d._id)}>Reply</CustomButton>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies Thread */}
                {d.replies?.length > 0 && (
                  <div className="mt-4 space-y-4 pl-4 border-l-2 border-border/40">
                    {d.replies.map((reply, i) => (
                      <div key={i} className="flex gap-3">
                        <img
                          src={reply.user?.avatar || `https://ui-avatars.com/api/?name=${reply.user?.name?.charAt(0) || 'U'}&background=6366f1&color=fff`}
                          alt={reply.user?.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{reply.user?.name}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 mt-0.5">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(DiscussionSection);
