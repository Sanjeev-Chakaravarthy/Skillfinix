import React, { useState, useEffect, useRef } from "react";
import {
  Loader2, Users, MessageSquare, Plus, ExternalLink, Globe2,
  X, AlertCircle, Search, ChevronRight, MoreVertical, Edit2, Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

/* ─── Image helper ───────────────────────────────────────────────── */
const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("/uploads")) {
    return `http://localhost:5005${url}`;
  }
  return url;
};

/* ─── Category filter list ─────────────────────────────────────── */
const CATEGORIES = [
  "All", "Technology", "Design", "Business", "Language",
  "Music", "Fitness", "Cooking", "Photography", "Finance", "Other",
];

/* ─── Skeleton card ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden animate-pulse">
      <div className="h-32 bg-muted" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="h-3 bg-muted rounded w-1/4" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
        <div className="h-10 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

/* ─── Empty state ──────────────────────────────────────────────── */
function EmptyState({ onCreateClick }) {
  return (
    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
        style={{ background: "hsl(var(--primary) / 0.10)" }}
      >
        <Globe2 className="w-8 h-8" style={{ color: "hsl(var(--primary))" }} />
      </div>
      <h3 className="text-xl font-heading font-semibold text-foreground">
        No communities yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Be the first to start a hub. Bring people together around a skill or topic you care about.
      </p>
      <button
        onClick={onCreateClick}
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:-translate-y-0.5 transition-all duration-200"
        style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.3)" }}
      >
        <Plus className="w-4 h-4" />
        Create First Hub
      </button>
    </div>
  );
}

/* ─── Confirm Delete Modal ───────────────────────────────────────── */
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "hsl(var(--foreground) / 0.35)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "hsl(var(--destructive) / 0.10)" }}>
            <AlertCircle className="w-6 h-6" style={{ color: "hsl(var(--destructive))" }} />
          </div>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-10 rounded-xl border font-medium text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-10 rounded-xl font-semibold text-sm text-white bg-destructive hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ boxShadow: "0 4px 12px hsl(var(--destructive) / 0.25)" }}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Community Modal (Create / Edit) ──────────────────────────── */
export function CommunityModal({ onClose, onSaved, initialData = null }) {
  const isEditing = !!initialData;

  const resolveCategory = (cat) => {
    if (!cat) return "Technology";
    if (CATEGORIES.includes(cat) && cat !== "All") return cat;
    return "Other";
  };

  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: resolveCategory(initialData?.category),
    customCategory: resolveCategory(initialData?.category) === "Other" ? (initialData?.category || "") : "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.coverImage || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Community name is required.");
    if (!form.description.trim()) return setError("Description is required.");
    
    let finalCategory = form.category;
    if (form.category === "Other") {
      if (!form.customCategory.trim()) return setError("Please enter your custom category.");
      finalCategory = form.customCategory.trim();
    }

    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("category", finalCategory);
      
      if (imageFile) {
        formData.append("coverImage", imageFile);
      } else {
        formData.append("coverImage", imagePreview);
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      let data;
      if (isEditing) {
        const res = await api.put(`/communities/${initialData._id}`, formData, config);
        data = res.data;
      } else {
        const res = await api.post("/communities", formData, config);
        data = res.data;
      }
      onSaved(data, isEditing);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} community.`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      return setError("Only JPEG, PNG and WEBP images are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return setError("Image must be smaller than 5MB.");
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-20 backdrop-blur-sm"
      style={{ background: "hsl(var(--foreground) / 0.35)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card border border-border rounded-3xl shadow-xl w-full max-w-md overflow-y-auto max-h-[calc(100vh-6rem)] scrollbar-hide"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">
              {isEditing ? "Edit Hub" : "Create a Hub"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEditing ? "Update your community details" : "Build a community around a skill or topic"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div
              className="flex items-start gap-2 p-3 rounded-xl text-sm"
              style={{
                background: "hsl(var(--destructive) / 0.08)",
                color: "hsl(var(--destructive))",
                border: "1px solid hsl(var(--destructive) / 0.2)",
              }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Hub name <span className="text-destructive">*</span>
            </label>
            <input
              ref={nameRef}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Python Learners Circle"
              maxLength={50}
              className="w-full h-11 px-4 rounded-xl border outline-none text-sm transition-all"
              style={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "hsl(var(--primary))";
                e.target.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "hsl(var(--border))";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What is this community about? Who should join?"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border outline-none text-sm resize-none transition-all"
              style={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "hsl(var(--primary))";
                e.target.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "hsl(var(--border))";
                e.target.style.boxShadow = "none";
              }}
            />
            <p className="text-xs text-muted-foreground text-right">
              {form.description.length}/500
            </p>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-xl border outline-none text-sm transition-all appearance-none"
              style={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <AnimatePresence>
            {form.category === "Other" && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-sm font-medium text-foreground">
                  Your custom category <span className="text-destructive">*</span>
                </label>
                <input
                  name="customCategory"
                  value={form.customCategory}
                  onChange={handleChange}
                  placeholder="e.g. Neuroscience, Blockchain"
                  maxLength={30}
                  className="w-full h-11 px-4 rounded-xl border outline-none text-sm transition-all"
                  style={{
                    background: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "hsl(var(--primary))";
                    e.target.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "hsl(var(--border))";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cover image upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Cover image <span className="text-muted-foreground font-normal">(optional)</span></span>
              {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-destructive font-normal normal-case hover:underline text-xs"
                  >
                    Remove
                  </button>
                )}
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all overflow-hidden ${imagePreview ? "border-primary/50" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}
                style={{ background: "hsl(var(--background))" }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Click or drag image here</p>
                      <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG, WEBP (max 5MB)</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-11 rounded-xl gradient-primary text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
              style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.28)" }}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? "Updating…" : "Creating…"}</>
              ) : (
                <><Plus className="w-4 h-4" /> {isEditing ? "Update Hub" : "Create Hub"}</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Community Card ───────────────────────────────────────────── */
function CommunityCard({ community, currentUserId, onJoin, joining, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isCreator = (community.createdBy?._id || community.createdBy)?.toString() === currentUserId?.toString();

  // Support both user.id (JWT payload) and user._id (mongoose doc)
  const isMember = community.members.some(
    (m) => (m._id || m)?.toString() === currentUserId?.toString()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card rounded-3xl border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col overflow-hidden"
    >
      {/* Cover image or Gradient Fallback */}
      <div className="w-full h-32 relative overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
        {community.coverImage ? (
          <>
            <img
              src={resolveImageUrl(community.coverImage)}
              alt={community.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/80 to-purple-600/80 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <span className="text-5xl font-heading font-bold text-white/90 uppercase drop-shadow-md">
              {community.name.charAt(0)}
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent mix-blend-multiply" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3.5 left-4">
          <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[11px] font-semibold text-white/90 border border-white/10 uppercase tracking-wider">
            {community.category}
          </span>
        </div>

        {/* 3-dot menu for creator */}
        {isCreator && (
          <div className="absolute top-3 right-3 z-20">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60 transition-colors border border-white/10"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); }} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute top-full right-0 mt-1 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20"
                  >
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); onEdit(community); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Hub
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); onDelete(community._id, community.name); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-heading font-bold text-foreground mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
          {community.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
          {community.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
              <span className="text-foreground font-semibold">{community.members?.length || 0}</span>
              <span>members</span>
            </div>
            {community.posts?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                <span>{community.posts.length}</span>
              </div>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground">
            by{" "}
            <span className="font-semibold text-foreground/80">
              {community.createdBy?.name || "Skillfinix"}
            </span>
          </div>
        </div>

        {/* CTA row */}
        <div className="flex gap-2.5 mt-3.5">
          <button
            disabled={joining === community._id}
            onClick={() => onJoin(community._id, isMember)}
            className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              isMember
                ? "border border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5"
                : "gradient-primary text-white hover:-translate-y-0.5"
            } disabled:opacity-60 disabled:translate-y-0`}
            style={
              !isMember
                ? { boxShadow: "0 3px 12px hsl(var(--primary) / 0.25)" }
                : {}
            }
          >
            {joining === community._id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isMember ? (
              "Leave Hub"
            ) : (
              "Join Hub"
            )}
          </button>
          <Link
            to={`/communities/${community._id}`}
            className="h-10 w-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-accent/50 transition-all duration-200 flex-shrink-0"
            title="Open community"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MAIN PAGE ────────────────────────────────────────────────── */
const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [joining, setJoining] = useState(null); // communityId being toggled
  const [showCreate, setShowCreate] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [communityToDelete, setCommunityToDelete] = useState(null); // holds {id, name}
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch]   = useState("");

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/communities");
      setCommunities(data || []);
    } catch (err) {
      setError("Could not load communities. Please try again.");
      console.error("Community fetch error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId, isMember) => {
    if (!user) {
      toast({ title: "Sign in to join communities", variant: "default" });
      return;
    }
    setJoining(communityId);
    try {
      const { data } = await api.put(`/communities/${communityId}/join`);
      toast({ title: data.message });
      // Optimistic UI update
      setCommunities((prev) =>
        prev.map((c) => {
          if (c._id !== communityId) return c;
          const userId = user._id || user.id;
          const members = data.isMember
            ? [...c.members, { _id: userId }]
            : c.members.filter((m) => (m._id || m)?.toString() !== userId?.toString());
          return { ...c, members };
        })
      );
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setJoining(null);
    }
  };

  const handleSaved = (savedCommunity, isEdit) => {
    if (isEdit) {
      setCommunities((prev) => prev.map(c => c._id === savedCommunity._id ? savedCommunity : c));
      toast({ title: `"${savedCommunity.name}" updated!` });
    } else {
      setCommunities((prev) => [savedCommunity, ...prev]);
      toast({ title: `"${savedCommunity.name}" hub created!` });
    }
  };

  const handleDeleteClick = (id, name) => {
    setCommunityToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!communityToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/communities/${communityToDelete.id}`);
      setCommunities((prev) => prev.filter(c => c._id !== communityToDelete.id));
      toast({ title: `"${communityToDelete.name}" deleted.` });
      setCommunityToDelete(null);
    } catch (err) {
      toast({ title: "Failed to delete community.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── Filtering ─────────────────────────────────────────────── */
  const filtered = communities.filter((c) => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  /* ── Render ────────────────────────────────────────────────── */
  const currentUserId = user?._id || user?.id;

  return (
    <>
      {/* Modals */}
      <AnimatePresence>
        {communityToDelete && (
          <ConfirmModal
            isOpen={!!communityToDelete}
            onClose={() => setCommunityToDelete(null)}
            onConfirm={confirmDelete}
            title="Delete Hub?"
            message={`Are you sure you want to permanently delete "${communityToDelete.name}"? This action cannot be undone and all posts will be lost.`}
            isDeleting={isDeleting}
          />
        )}
        {showCreate && (
          <CommunityModal
            onClose={() => setShowCreate(false)}
            onSaved={handleSaved}
          />
        )}
        {editingCommunity && (
          <CommunityModal
            initialData={editingCommunity}
            onClose={() => setEditingCommunity(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 pb-20">

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-border/40">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2.5 rounded-xl"
                style={{ background: "hsl(var(--primary) / 0.10)" }}
              >
                <Globe2
                  className="w-5 h-5"
                  style={{ color: "hsl(var(--primary))" }}
                />
              </div>
              <h1 className="heading-display text-3xl sm:text-4xl text-foreground">
                Communities
              </h1>
            </div>
            <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
              Skill hubs built by real people. Join groups, ask questions, and
              swap knowledge with others who share your interests.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary transition-all duration-200 hover:-translate-y-0.5"
            style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.28)" }}
          >
            <Plus className="w-4 h-4" />
            Create Hub
          </button>
        </div>

        {/* ── Search + Category tabs ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communities…"
              className="w-full h-10 pl-9 pr-4 rounded-xl border outline-none text-sm transition-all"
              style={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "hsl(var(--primary))";
                e.target.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.10)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "hsl(var(--border))";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  background:
                    activeCategory === cat
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted))",
                  color:
                    activeCategory === cat
                      ? "hsl(var(--primary-foreground))"
                      : "hsl(var(--muted-foreground))",
                  boxShadow:
                    activeCategory === cat
                      ? "0 2px 8px hsl(var(--primary) / 0.25)"
                      : "none",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error state ─────────────────────────────────────── */}
        {error && !loading && (
          <div
            className="flex items-start gap-3 p-4 rounded-2xl mb-6 text-sm border"
            style={{
              background: "hsl(var(--destructive) / 0.07)",
              borderColor: "hsl(var(--destructive) / 0.20)",
              color: "hsl(var(--destructive))",
            }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              {error}
              <button
                onClick={fetchCommunities}
                className="ml-3 underline underline-offset-2 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ── Community grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState onCreateClick={() => setShowCreate(true)} />
          ) : (
            filtered.map((community, idx) => (
              <motion.div
                key={community._id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <CommunityCard
                  community={community}
                  currentUserId={currentUserId}
                  onJoin={handleJoin}
                  joining={joining}
                  onEdit={setEditingCommunity}
                  onDelete={handleDeleteClick}
                />
              </motion.div>
            ))
          )}
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-10">
            {filtered.length} {filtered.length === 1 ? "community" : "communities"} found
            {activeCategory !== "All" && ` in ${activeCategory}`}
          </p>
        )}
      </div>
    </>
  );
};

export default Communities;
