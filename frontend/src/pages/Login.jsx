import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Star,
  ShieldCheck,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

/* ─── Reusable form field component ─────────────────────────────────── */
function FormField({ label, id, children, hint, error }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-foreground/80"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs flex items-center gap-1 text-destructive font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Input with elevated focus style ────────────────────────────────── */
function InputField({ icon: Icon, type = "text", right, ...props }) {
  return (
    <div className="relative group">
      {Icon && (
        <Icon className="absolute w-4 h-4 left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
      )}
      <input
        type={type}
        className="w-full h-11 rounded-lg border border-border bg-card text-foreground text-sm outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary placeholder:text-muted-foreground/60 disabled:opacity-50"
        style={{
          paddingLeft: Icon ? "2.5rem" : "1rem",
          paddingRight: right ? "2.75rem" : "1rem",
        }}
        {...props}
      />
      {right}
    </div>
  );
}

/* ─── Password eye toggle ────────────────────────────────────────────── */
function EyeToggle({ show, onToggle }) {
  const Icon = show ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label={show ? "Hide password" : "Show password"}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

/* ─── Brand left panel with authentic Social Proof Card ───────────────── */
function BrandPanel() {
  return (
    <div
      className="hidden lg:flex w-[45%] h-full flex-col justify-between p-12 relative overflow-hidden flex-shrink-0 text-white"
      style={{
        background:
          "radial-gradient(ellipse at 20% 30%, hsl(243 75% 15%) 0%, hsl(222 47% 8%) 65%, hsl(224 71% 4%) 100%)",
      }}
    >
      {/* Ambient glowing radial orbs */}
      <div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.28) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--secondary) / 0.22) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Top Logo */}
      <Link
        to="/welcome"
        aria-label="Go to welcome page"
        className="relative z-10 flex items-center gap-3 group w-fit"
      >
        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
          S
        </div>
        <span className="text-white text-xl font-extrabold font-heading tracking-tight">
          Skillfinix
        </span>
      </Link>

      {/* Center Social Proof Card (Linear / Raycast style) */}
      <div className="relative z-10 space-y-6 my-auto">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold border border-white/15 text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Verified Skill Exchange Community
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight leading-snug">
            Trade what you know.
            <br />
            <span>Learn what you don’t.</span>
          </h2>
        </div>

        {/* Elevated Testimonial Card */}
        <div className="p-6 rounded-2xl bg-white/[0.06] border border-white/15 shadow-lg space-y-4">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <p className="text-sm leading-relaxed text-white/90 font-medium">
            “I swapped 10 hours of Design Systems coaching for hands-on PyTorch & FastAPI architecture with a staff engineer. Zero tuition, zero fluff. Pure masterclass quality.”
          </p>
          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              E
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Elena Vance <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[11px] text-white/60">Product Architect @ Lattice</div>
            </div>
          </div>
        </div>

        {/* Community Proof Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {["4,800+ Skills", "2,100+ Members", "100% Free Peer Barter"].map((t) => (
            <span
              key={t}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white/90"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 text-xs text-white/40">
        Skillfinix © 2026 · Decentralized Peer Learning Economy
      </div>
    </div>
  );
}

/* ─── Shared Sub-components ─────────────────────────────────────────── */

function GoogleButton({ onSuccess, onError, disabled }) {
  return (
    <div className="relative w-full">
      <div
        className={`w-full h-11 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center gap-3 text-sm font-semibold transition-colors duration-150 pointer-events-none select-none text-foreground shadow-xs ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </div>

      <div
        className="absolute inset-0 opacity-0"
        style={{ pointerEvents: disabled ? "none" : "auto" }}
      >
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          width="420"
          shape="rectangular"
          theme="outline"
        />
      </div>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div className="relative flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function PrimaryButton({ loading, label, loadingLabel }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileTap={!loading ? { scale: 0.98 } : {}}
      className="w-full h-11 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-dark flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs active:translate-y-px focus-visible:outline-2 focus-visible:outline-primary"
    >
      {loading ? (
        <>
          <svg aria-hidden="true" className="w-4 h-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          {loadingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </motion.button>
  );
}

/* ─── LOGIN PAGE ─────────────────────────────────────────────────────── */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const user = result.user || {};
        const isNewUser = !user?.bio && (!user?.skills || user.skills.length === 0);
        navigate(isNewUser ? "/profile" : "/");
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        const user = result.user || {};
        const isNewUser = !user?.bio && (!user?.skills || user.skills.length === 0);
        navigate(isNewUser ? "/profile" : "/");
      } else {
        setError(result.error || "Google login failed.");
      }
    } catch {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex bg-background">
      <BrandPanel />

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile Logo */}
          <Link
            to="/welcome"
            aria-label="Go to home"
            className="lg:hidden flex items-center gap-2.5 mb-8 group w-fit"
          >
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-heading font-bold text-lg text-foreground">
              Skillfinix
            </span>
          </Link>

          {/* Elevated Form Card */}
          <div className="p-7 sm:p-9 rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-card">
            <div className="mb-6">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Sign in to manage your skill barters and live chats.
              </p>
            </div>

            {/* Error Notification */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2.5 p-3 mb-5 rounded-xl text-xs border bg-destructive/10 border-destructive/25 text-destructive font-medium"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google OAuth Button */}
            <div className="mb-4">
              <GoogleButton
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In was cancelled or not allowed.")}
                disabled={loading}
              />
            </div>

            <Divider label="or with email" />

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <FormField label="Email address" id="email">
                <InputField
                  id="email"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </FormField>

              <FormField label="Password" id="password">
                <InputField
                  id="password"
                  type={showPw ? "text" : "password"}
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  right={
                    <EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />
                  }
                />
                <div className="flex justify-end mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-primary hover:underline"
                    tabIndex={loading ? -1 : 0}
                  >
                    Forgot password?
                  </Link>
                </div>
              </FormField>

              <div className="pt-2">
                <PrimaryButton
                  loading={loading}
                  label="Sign in to Skillfinix"
                  loadingLabel="Signing in…"
                />
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-border/60 text-center">
              <p className="text-xs text-muted-foreground">
                New to Skillfinix?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-primary hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export {
  BrandPanel,
  FormField,
  InputField,
  EyeToggle,
  GoogleButton,
  Divider,
  PrimaryButton,
};
export default Login;
