import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Send, ChevronDown, Loader2, Ticket,
  CheckCircle, Clock, AlertCircle, Mail, MessageSquare, Plus
} from 'lucide-react';
import api from '@/api/axios';
import { toast } from 'sonner';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const STATUS_CONFIG = {
  Open: { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  'In Progress': { className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', icon: <Clock className="w-3.5 h-3.5" /> },
  Resolved: { className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400', icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

const StatusBadge = ({ status }) => {
  const { className, icon } = STATUS_CONFIG[status] || STATUS_CONFIG.Open;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>
      {icon} {status}
    </span>
  );
};

const FAQ_ITEMS = [
  {
    q: 'How do I enroll in a course?',
    a: 'Go to Skill Hunt, find a course you like, and click the Enroll button. You\'ll get instant access to start learning.',
  },
  {
    q: 'Can I get a refund for a course?',
    a: 'We offer a 7-day money-back guarantee for paid courses. Raise a support ticket with category "Payment" and we\'ll process it within 3 business days.',
  },
  {
    q: 'How do I become a mentor?',
    a: 'Send a request via the support form with category "Account", mentioning your skills and experience. Our team will review and upgrade your account.',
  },
  {
    q: 'My video is not loading — what should I do?',
    a: 'Try refreshing the page, clearing your browser cache, or switching to a different browser. If it still doesn\'t work, raise a Technical ticket.',
  },
  {
    q: 'How do Live Sessions work?',
    a: 'Mentors schedule live sessions with a meeting link (Zoom, Google Meet, etc.). You can join from the Live Sessions page. Recordings are posted after the session ends.',
  },
  {
    q: 'How do I change my password?',
    a: 'Go to Settings → Account. You can update your password from there. If you\'ve forgotten it, use the "Forgot password" link on the Login page.',
  },
];

const FAQItem = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      className="border border-border/60 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm text-foreground pr-4">{item.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-muted-foreground border-t border-border/40 pt-3">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CATEGORIES = ['Technical', 'Payment', 'Account', 'Other'];

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', category: 'Technical' });
  const [showForm, setShowForm] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      const res = await api.get('/support/my-tickets');
      setTickets(res.data || []);
    } catch (e) {
      console.error('Fetch tickets error:', e);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error('Subject and description are required');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post('/support', form);
      setTickets((prev) => [res.data, ...prev]);
      setForm({ subject: '', description: '', category: 'Technical' });
      setShowForm(false);
      toast.success('Ticket submitted! We\'ll get back to you soon.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 rounded-3xl overflow-hidden p-8 md:p-10 gradient-hero text-white shadow-xl"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <HelpCircle className="w-4 h-4" /> Help & Support
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-heading font-bold mb-2">How can we help you?</h1>
          <p className="text-white/80 max-w-lg text-sm md:text-base mb-5">
            Raise a support ticket, browse FAQs, or get in touch with us directly. We typically respond within 24 hours.
          </p>
          {/* Contact email */}
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:support@skillfinix.com"
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors px-4 py-2.5 rounded-xl text-sm font-medium"
            >
              <Mail className="w-4 h-4" /> support@skillfinix.com
            </a>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-medium">
              <Clock className="w-4 h-4" /> Mon–Sat, 9 AM – 6 PM IST
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Ticket Form + My Tickets */}
        <div className="lg:col-span-3 space-y-6">
          {/* Raise Ticket */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Raise a Support Ticket</h2>
              </div>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> New Ticket</>}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Category *</label>
                        <select
                          className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50"
                          value={form.category}
                          onChange={(e) => set('category', e.target.value)}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Subject *</label>
                        <input
                          className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50"
                          value={form.subject}
                          onChange={(e) => set('subject', e.target.value)}
                          placeholder="Brief description of your issue"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Description *</label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        value={form.description}
                        onChange={(e) => set('description', e.target.value)}
                        placeholder="Describe your problem in detail..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Submit Ticket
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {!showForm && (
              <div className="px-6 py-5 text-center text-muted-foreground text-sm">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                Click <strong>New Ticket</strong> to raise a support request.
              </div>
            )}
          </motion.div>

          {/* My Tickets */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">My Tickets</h2>
                {tickets.length > 0 && (
                  <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                    {tickets.length}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {ticketsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="rounded-xl bg-muted animate-pulse h-20" />
                ))
              ) : tickets.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  No tickets yet. Raise one if you need help!
                </div>
              ) : (
                tickets.map((ticket, i) => (
                  <motion.div
                    key={ticket._id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex flex-col gap-2 p-4 rounded-xl border border-border/60 bg-background hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(ticket.createdAt)}</p>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {ticket.category}
                      </span>
                    </div>
                    {ticket.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
                    )}
                    {ticket.adminReply && (
                      <div className="mt-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs font-semibold text-primary mb-1">💬 Support Reply:</p>
                        <p className="text-xs text-foreground">{ticket.adminReply}</p>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Right: FAQ */}
        <div className="lg:col-span-2">
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden sticky top-20"
          >
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Frequently Asked Questions</h2>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem key={i} item={item} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
