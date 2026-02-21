import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight, CheckCircle, XCircle, Clock, Trophy,
  Plus, User, Star, Loader2, Send, MessageSquare, RefreshCw,
  Flame, Zap, Award
} from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const STATUS_CONFIG = {
  Pending:   { className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',   icon: <Clock className="w-3.5 h-3.5" />,        dot: 'bg-amber-400' },
  Accepted:  { className: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',    icon: <CheckCircle className="w-3.5 h-3.5" />,   dot: 'bg-blue-400' },
  Rejected:  { className: 'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',     icon: <XCircle className="w-3.5 h-3.5" />,       dot: 'bg-red-400' },
  Completed: { className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',   icon: <Trophy className="w-3.5 h-3.5" />,        dot: 'bg-green-400' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>
      {cfg.icon} {status}
    </span>
  );
};

const getAvatar = (user) => {
  if (user?.avatar) return user.avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&bold=true`;
};

const LEVEL_COLORS = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-blue-100 text-blue-700',
  Advanced: 'bg-violet-100 text-violet-700',
};

// -------------------------------------------------------
// SwapCard
// -------------------------------------------------------
const SwapCard = ({ swap, currentUserId, onAccept, onReject, onComplete, onMessage, loadingId }) => {
  const isSent = swap.requester?._id === currentUserId;
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const other = isSent ? swap.recipient : swap.requester;

  const handleComplete = () => {
    onComplete(swap._id, { rating, feedback });
    setShowFeedback(false);
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      layout
      className="rounded-2xl border border-border/60 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img src={getAvatar(other)} alt={other?.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-border" />
            <div>
              <p className="font-semibold text-foreground text-sm">{other?.name || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{isSent ? 'Sent' : 'Received'}</p>
            </div>
          </div>
          <StatusBadge status={swap.status} />
        </div>

        {/* Skill Exchange */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-400 mb-1">
              {isSent ? 'I Teach' : 'They Teach'}
            </p>
            <p className="text-sm font-bold text-foreground">{swap.teachSkill}</p>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/40 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-400 mb-1">
              {isSent ? 'I Learn' : 'They Learn'}
            </p>
            <p className="text-sm font-bold text-foreground">{swap.learnSkill}</p>
          </div>
        </div>

        {/* Level */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[swap.requesterLevel] || LEVEL_COLORS.Beginner}`}>
            {swap.requesterLevel}
          </span>
          {swap.message && (
            <p className="text-xs text-muted-foreground italic truncate flex-1">"{swap.message}"</p>
          )}
        </div>

        {/* Date */}
        <p className="text-xs text-muted-foreground mb-4">
          {new Date(swap.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Recipient can Accept/Reject a pending swap */}
          {!isSent && swap.status === 'Pending' && (
            <>
              <button
                onClick={() => onAccept(swap._id)}
                disabled={loadingId === swap._id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {loadingId === swap._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Accept
              </button>
              <button
                onClick={() => onReject(swap._id)}
                disabled={loadingId === swap._id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}

          {/* Either party can mark as complete */}
          {(isSent || !isSent) && swap.status === 'Accepted' && !showFeedback && (
            <button
              onClick={() => setShowFeedback(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Trophy className="w-3.5 h-3.5" /> Mark Complete
            </button>
          )}

          {/* Chat */}
          <button
            onClick={() => onMessage(other)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat
          </button>
        </div>

        {/* Feedback form */}
        {showFeedback && (
          <div className="mt-4 space-y-3 p-3 rounded-xl bg-muted/50">
            <p className="text-xs font-semibold text-foreground">Rate this swap:</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)}>
                  <Star className={`w-5 h-5 transition-colors ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Leave feedback (optional)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background outline-none resize-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex gap-2">
              <button
                onClick={handleComplete}
                disabled={loadingId === swap._id}
                className="flex-1 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {loadingId === swap._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trophy className="w-3 h-3" />}
                Submit & Complete
              </button>
              <button onClick={() => setShowFeedback(false)} className="px-3 py-2 rounded-xl bg-muted text-xs">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// -------------------------------------------------------
// Create Swap Modal
// -------------------------------------------------------
const CreateSwapModal = ({ onClose, onCreated }) => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    recipientId: '', teachSkill: '', learnSkill: '',
    requesterLevel: 'Beginner', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    api.get('/users/barters').then(r => setUsers(r.data || [])).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.skills || []).some(s => s.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.recipientId || !form.teachSkill || !form.learnSkill) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post('/swaps', form);
      toast.success('Swap request sent!');
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-border gradient-hero text-white flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" /> Request Skill Swap
          </h2>
          <p className="text-sm text-white/70 mt-1">Teach what you know. Learn what you need.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Select User */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Select Person to Swap With *</label>
            <input
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm outline-none mb-2 focus:ring-2 focus:ring-primary/40"
              placeholder="Search by name or skill..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-border rounded-xl p-2">
              {filteredUsers.slice(0, 20).map(u => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => set('recipientId', u._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    form.recipientId === u._id ? 'bg-primary/10 border-primary border' : 'hover:bg-muted border border-transparent'
                  }`}
                >
                  <img src={getAvatar(u)} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{u.name}</p>
                    {u.skills?.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">Teaches: {u.skills.slice(0,3).join(', ')}</p>
                    )}
                  </div>
                  {form.recipientId === u._id && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-3">No users found</p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">I Will Teach *</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/40"
                value={form.teachSkill}
                onChange={e => set('teachSkill', e.target.value)}
                placeholder="e.g. React, Guitar"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">I Want to Learn *</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/40"
                value={form.learnSkill}
                onChange={e => set('learnSkill', e.target.value)}
                placeholder="e.g. Python, Drawing"
                required
              />
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">My Skill Level</label>
            <div className="flex gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => set('requesterLevel', lvl)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    form.requesterLevel === lvl
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Message (optional)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm outline-none resize-none focus:ring-2 focus:ring-primary/40"
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder="Tell them why you want to swap skills..."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Request
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'Pending', label: '⏳ Pending' },
  { key: 'Accepted', label: '✅ Active' },
  { key: 'Completed', label: '🏆 Completed' },
  { key: 'Rejected', label: '❌ Rejected' },
];

const ROLE_TABS = [
  { key: '', label: 'All' },
  { key: 'sent', label: 'Sent' },
  { key: 'received', label: 'Received' },
];

export default function MySwaps() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('');
  const [roleTab, setRoleTab] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const fetchSwaps = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleTab) params.role = roleTab;
      if (statusTab) params.status = statusTab;
      const [swapsRes, statsRes] = await Promise.all([
        api.get('/swaps', { params }),
        api.get('/swaps/stats'),
      ]);
      setSwaps(swapsRes.data || []);
      setStats(statsRes.data);
    } catch (e) {
      console.error('Fetch swaps error:', e);
    } finally {
      setLoading(false);
    }
  }, [statusTab, roleTab]);

  useEffect(() => { fetchSwaps(); }, [fetchSwaps]);

  const handleAccept = async (id) => {
    try {
      setLoadingId(id);
      await api.put(`/swaps/${id}/accept`);
      toast.success('Swap accepted!');
      fetchSwaps();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to accept');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoadingId(id);
      await api.put(`/swaps/${id}/reject`);
      toast.success('Swap rejected.');
      fetchSwaps();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject');
    } finally {
      setLoadingId(null);
    }
  };

  const handleComplete = async (id, { rating, feedback }) => {
    try {
      setLoadingId(id);
      await api.put(`/swaps/${id}/complete`, { rating, feedback });
      toast.success('Swap marked as completed! 🏆');
      fetchSwaps();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to complete');
    } finally {
      setLoadingId(null);
    }
  };

  const handleMessage = (other) => {
    navigate('/skill-chat', { state: { selectedUserId: other._id, selectedUserData: other } });
  };

  const pending = swaps.filter(s => s.status === 'Pending').length;
  const active  = swaps.filter(s => s.status === 'Accepted').length;
  const done    = swaps.filter(s => s.status === 'Completed').length;

  return (
    <div className="min-h-screen pb-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 rounded-3xl overflow-hidden p-8 md:p-10 gradient-hero text-white shadow-xl"
      >
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <ArrowLeftRight className="w-4 h-4" /> My Skill Swaps
            </span>
            {pending > 0 && (
              <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {pending} pending
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-heading font-bold mb-2">Your Skill Exchange Hub</h1>
          <p className="text-white/80 max-w-xl text-sm md:text-base mb-5">
            Teach what you know. Learn what you need. Track all your skill swap requests here.
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Total Swaps',  value: stats?.total || 0,     Icon: ArrowLeftRight },
              { label: 'Active',       value: active,                 Icon: Zap },
              { label: 'Completed',    value: stats?.completed || 0,  Icon: Trophy },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-3 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-white/70 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Role tabs */}
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {ROLE_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setRoleTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  roleTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button onClick={fetchSwaps} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            <Plus className="w-4 h-4" /> New Swap
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="rounded-2xl bg-muted animate-pulse h-56" />)}
        </div>
      ) : swaps.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-5">
            <ArrowLeftRight className="w-9 h-9 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No swaps yet!</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Start exchanging skills with peers. Send your first swap request!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Request First Swap
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {swaps.map((swap, i) => (
              <SwapCard
                key={swap._id}
                swap={swap}
                currentUserId={user?._id || user?.id}
                onAccept={handleAccept}
                onReject={handleReject}
                onComplete={handleComplete}
                onMessage={handleMessage}
                loadingId={loadingId}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Popular Skills from Stats */}
      {stats?.popularSkills?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-heading font-bold text-foreground">Most Swapped Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.popularSkills.map((s, i) => (
              <span
                key={s.skill}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-medium text-foreground shadow-card"
              >
                {i < 3 && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                {s.skill}
                <span className="text-xs text-muted-foreground ml-1">×{s.swapCount}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <CreateSwapModal
            onClose={() => setShowModal(false)}
            onCreated={(s) => { setSwaps(p => [s, ...p]); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
