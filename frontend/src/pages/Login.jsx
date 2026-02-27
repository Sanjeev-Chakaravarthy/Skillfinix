import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

/* ─── Reusable field component ─────────────────────────────────────── */
function FormField({ label, id, children, hint, error }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium"
        style={{ color: "hsl(var(--foreground))" }}
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          {hint}
        </p>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs flex items-center gap-1"
            style={{ color: "hsl(var(--warning))" }}
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Input with unified focus style ────────────────────────────────── */
function InputField({ icon: Icon, type = "text", right, ...props }) {
  return (
    <div className="relative group">
      {Icon && (
        <Icon
          className="absolute w-4 h-4 left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-[hsl(var(--primary))]"
          style={{ color: "hsl(var(--muted-foreground))" }}
        />
      )}
      <input
        type={type}
        className="w-full h-12 rounded-xl border outline-none text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          paddingLeft: Icon ? "2.5rem" : "1rem",
          paddingRight: right ? "3rem" : "1rem",
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
      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 hover:opacity-70"
      style={{ color: "hsl(var(--muted-foreground))" }}
      aria-label={show ? "Hide password" : "Show password"}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

/* ─── Brand left panel ───────────────────────────────────────────────── */
function BrandPanel() {
  return (
    <div
      className="hidden lg:flex w-2/5 h-full flex-col justify-between p-12 relative overflow-hidden flex-shrink-0"
      style={{ background: "hsl(240 10% 10%)" }}
    >
      {/* Gradient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 80%, hsl(var(--primary) / 0.22) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 80% 10%, hsl(var(--secondary) / 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Logo — links back to welcome page */}
      <Link
        to="/welcome"
        aria-label="Go to home"
        className="relative z-10 flex items-center gap-3 group w-fit"
      >
        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg transition-transform duration-200 group-hover:scale-105">
          S
        </div>
        <span className="text-white text-xl font-bold font-heading tracking-tight transition-opacity duration-200 group-hover:opacity-70">
          Skillfinix
        </span>
      </Link>

      {/* Quote */}
      <div className="relative z-10 space-y-6">
        <blockquote
          className="text-3xl font-heading font-bold leading-snug"
          style={{ color: "#fff" }}
        >
          "Every person
          <br />
          is a library.
          <br />
          <span className="gradient-text">Find yours."</span>
        </blockquote>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.46)" }}>
          Teach what you know. Learn what you don't.
          <br />
          No classrooms. No algorithms.
        </p>

        {/* Trust dots */}
        <div className="flex items-center gap-3">
          {["4.8k+ skills", "2.1k+ people", "Zero cost"].map((t) => (
            <span
              key={t}
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                background: "hsl(var(--primary) / 0.14)",
                color: "hsl(var(--primary))",
                border: "1px solid hsl(var(--primary) / 0.25)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="relative z-10" />
    </div>
  );
}

/* ─── LOGIN PAGE ─────────────────────────────────────────────────────── */
const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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
    <div
      className="h-screen overflow-hidden flex"
      style={{ background: "hsl(var(--background))" }}
    >
      <BrandPanel />

      {/* Right — form panel scrolls internally on short viewports */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo — links back to welcome page */}
          <Link
            to="/welcome"
            aria-label="Go to home"
            className="lg:hidden flex items-center gap-2 mb-10 group w-fit"
          >
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm transition-transform duration-200 group-hover:scale-105">S</div>
            <span className="font-heading font-bold text-lg transition-opacity duration-200 group-hover:opacity-60" style={{ color: "hsl(var(--foreground))" }}>Skillfinix</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="font-heading text-3xl font-bold mb-2 leading-tight"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Welcome back.
            </h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Sign in to continue your skill exchange.
            </p>
          </div>

          {/* Global error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-2.5 p-3.5 mb-6 rounded-xl text-sm border"
                style={{
                  background: "hsl(var(--destructive) / 0.07)",
                  borderColor: "hsl(var(--destructive) / 0.22)",
                  color: "hsl(var(--destructive))",
                }}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google */}
          <div className="mb-5">
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
              disabled={loading}
            />
          </div>

          {/* Divider */}
          <Divider label="or continue with email" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mt-5">
            <FormField label="Email" id="email">
              <InputField
                id="email"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                right={<EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />}
              />
              <div className="flex justify-end mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium hover:underline transition-colors"
                  style={{ color: "hsl(var(--primary))" }}
                  tabIndex={loading ? -1 : 0}
                >
                  Forgot password?
                </Link>
              </div>
            </FormField>

            <PrimaryButton loading={loading} label="Sign in" loadingLabel="Signing in…" />
          </form>

          {/* Footer link */}
          <p className="text-sm text-center mt-8" style={{ color: "hsl(var(--muted-foreground))" }}>
            New to Skillfinix?{" "}
            <Link
              to="/signup"
              className="font-semibold hover:underline transition-colors"
              style={{ color: "hsl(var(--primary))" }}
            >
              Create a free account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

/* ─── Shared sub-components ─────────────────────────────────────────── */

function GoogleButton({ onSuccess, onError, disabled }) {
  return (
    <div className="relative w-full">
      {/* Custom styled button (visual only) */}
      <div
        className={`w-full h-12 rounded-xl border flex items-center justify-center gap-3 text-sm font-medium transition-all duration-200 pointer-events-none select-none ${disabled ? "opacity-50" : ""}`}
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          color: "hsl(var(--foreground))",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </div>

      {/* Real GoogleLogin — stretched to overlay for click capture */}
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
    <div className="relative flex items-center gap-3 my-0">
      <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
      <span className="text-xs font-medium flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
    </div>
  );
}

function PrimaryButton({ loading, label, loadingLabel }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={!loading ? { y: -2, boxShadow: "0 8px 24px hsl(var(--primary) / 0.35)" } : {}}
      whileTap={!loading ? { y: 0, scale: 0.98 } : {}}
      className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed gradient-primary"
      style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.28)" }}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
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

export { BrandPanel, FormField, InputField, EyeToggle, GoogleButton, Divider, PrimaryButton };
export default Login;