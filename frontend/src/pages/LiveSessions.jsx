import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Calendar, Clock, Users, Play, Video, Filter,
  Plus, ExternalLink, ChevronDown, Loader2, RefreshCw,
  CheckCircle2, AlertCircle, Wifi
} from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const StatusBadge = ({ status }) => {
  const config = {
    live: { label: 'LIVE', className: 'bg-red-500 text-white animate-pulse', icon: <Wifi className="w-3 h-3" /> },
    upcoming: { label: 'Upcoming', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', icon: <Clock className="w-3 h-3" /> },
    ended: { label: 'Ended', className: 'bg-muted text-muted-foreground', icon: <CheckCircle2 className="w-3 h-3" /> },
  };
  const { label, className, icon } = config[status] || config.upcoming;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${className}`}>
      {icon} {label}
    </span>
  );
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const SessionCard = ({ session, onJoin, joining, currentUser }) => {
  const isCreator = currentUser?._id === session.mentor?._id || currentUser?.id === session.mentor?._id;
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      layout
      className="rounded-2xl border border-border/60 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Thumbnail or gradient */}
      <div className="relative h-36 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 overflow-hidden">
        {session.thumbnail ? (
          <img src={session.thumbnail} alt={session.title} className="w-full h-full object-cover opacity-70" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio className="w-12 h-12 text-white/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <StatusBadge status={session.status} />
        </div>
        {session.category && (
          <div className="absolute bottom-3 right-3">
            <span className="text-xs bg-black/40 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {session.category}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{session.title}</h3>
        {session.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{session.description}</p>
        )}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {formatDate(session.scheduledAt)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {session.durationMinutes} minutes
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-primary" />
            {session.participants?.length || 0} / {session.maxParticipants} joined
          </div>
          {session.mentor && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <img
                src={session.mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentor.name || 'H')}&background=6366f1&color=fff`}
                alt={session.mentor.name}
                className="w-4 h-4 rounded-full object-cover"
              />
              Host: {session.mentor.name}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {session.status === 'live' && (
          <button
            onClick={() => onJoin(session._id, session.meetingLink)}
            disabled={joining === session._id}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {joining === session._id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Join Live Session
          </button>
        )}

        {session.status === 'upcoming' && (
          <button
            onClick={() => onJoin(session._id, session.meetingLink)}
            disabled={joining === session._id || isCreator}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {joining === session._id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            {isCreator ? 'Your Session' : 'Register & Join'}
          </button>
        )}

        {session.status === 'ended' && (
          <div className="space-y-2">
            {session.recordingUrl ? (
              <a
                href={session.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm transition-colors"
              >
                <Video className="w-4 h-4" /> Watch Recording
              </a>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-muted text-muted-foreground text-sm">
                <CheckCircle2 className="w-4 h-4" /> Session Ended
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Schedule modal — available to all users
const ScheduleModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '', description: '', category: 'General',
    scheduledAt: '', durationMinutes: 60, meetingLink: '', maxParticipants: 100,
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.scheduledAt) {
      toast.error('Title and scheduled time are required');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post('/live-sessions', form);
      toast.success('Session scheduled successfully!');
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule session');
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
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-border gradient-hero text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Radio className="w-5 h-5" /> Schedule New Session
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Session Title *</label>
            <input
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. React Hooks Deep Dive"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What will you cover?"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm outline-none"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {['General', 'Frontend', 'Backend', 'AI/ML', 'Design', 'Data Science', 'DevOps', 'Mobile'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Duration (min)</label>
              <input
                type="number"
                min={15} max={480}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm outline-none"
                value={form.durationMinutes}
                onChange={(e) => set('durationMinutes', parseInt(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Scheduled At *</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm outline-none"
              value={form.scheduledAt}
              onChange={(e) => set('scheduledAt', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Meeting Link</label>
            <input
              type="url"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm outline-none"
              value={form.meetingLink}
              onChange={(e) => set('meetingLink', e.target.value)}
              placeholder="https://meet.google.com/xxx"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Max Participants</label>
            <input
              type="number"
              min={2} max={1000}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm outline-none"
              value={form.maxParticipants}
              onChange={(e) => set('maxParticipants', parseInt(e.target.value))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
              Schedule Session
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'mine', label: 'My Sessions' },
];

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'live', label: '🔴 Live Now' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ended', label: 'Completed' },
];

export default function LiveSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusTab, setStatusTab] = useState('');
  const [joining, setJoining] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter) params.filter = filter;
      if (statusTab) params.status = statusTab;
      const res = await api.get('/live-sessions', { params });
      setSessions(res.data || []);
    } catch (e) {
      console.error('Fetch sessions error:', e);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [filter, statusTab]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleJoin = async (id, meetingLink) => {
    try {
      setJoining(id);
      const res = await api.post(`/live-sessions/${id}/join`);
      if (res.data.meetingLink) {
        window.open(res.data.meetingLink, '_blank');
      } else if (meetingLink) {
        window.open(meetingLink, '_blank');
      } else {
        toast.info('Registered! The meeting link will be shared by the mentor.');
      }
      toast.success('Joined session!');
      fetchSessions();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to join');
    } finally {
      setJoining(null);
    }
  };

  const liveSessions = sessions.filter((s) => s.status === 'live');
  const upcomingSessions = sessions.filter((s) => s.status === 'upcoming');
  const endedSessions = sessions.filter((s) => s.status === 'ended');

  const displaySessions = statusTab
    ? sessions
    : [...liveSessions, ...upcomingSessions, ...endedSessions];

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 rounded-3xl overflow-hidden p-8 md:p-10 gradient-hero text-white shadow-xl"
      >
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Radio className="w-4 h-4 text-red-300 animate-pulse" /> Live Sessions
            </span>
            {liveSessions.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                {liveSessions.length} LIVE NOW
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-heading font-bold mb-2">Live Learning Sessions</h1>
          <p className="text-white/80 max-w-xl text-sm md:text-base mb-5">
            Share skills live, teach others, join peer sessions, and learn in real-time.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-3 text-center">
              <p className="text-2xl font-bold">{liveSessions.length}</p>
              <p className="text-xs text-white/70 mt-0.5">Live Now</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-3 text-center">
              <p className="text-2xl font-bold">{upcomingSessions.length}</p>
              <p className="text-xs text-white/70 mt-0.5">Upcoming</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-3 text-center">
              <p className="text-2xl font-bold">{endedSessions.length}</p>
              <p className="text-xs text-white/70 mt-0.5">Recordings</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchSessions}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Schedule — all users can host a session */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            <Plus className="w-4 h-4" /> Schedule Session
          </button>
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse h-64" />
          ))}
        </div>
      ) : displaySessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Radio className="w-9 h-9 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No sessions found</h3>
          <p className="text-muted-foreground text-sm mb-6">Be the first! Schedule a skill-sharing session.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Schedule First Session
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySessions.map((session, i) => (
              <SessionCard
                key={session._id}
                session={session}
                onJoin={handleJoin}
                joining={joining}
                currentUser={user}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {showModal && (
          <ScheduleModal
            onClose={() => setShowModal(false)}
            onCreated={(s) => setSessions((prev) => [s, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
