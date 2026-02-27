import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import {
  BrandPanel,
  FormField,
  InputField,
  EyeToggle,
  GoogleButton,
  Divider,
  PrimaryButton,
} from "./Login";

/* ─── Password strength indicator ────────────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null;

  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  const levels = [
    { label: "Weak",   color: "hsl(var(--destructive))", width: "25%" },
    { label: "Fair",   color: "hsl(var(--warning))",     width: "50%" },
    { label: "Good",   color: "hsl(var(--info))",        width: "75%" },
    { label: "Strong", color: "hsl(var(--success))",     width: "100%" },
  ];

  const { label, color, width } = levels[Math.max(0, score - 1)];

  return (
    <div className="space-y-1">
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "hsl(var(--border))" }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: "0%" }}
          animate={{ width }}
          style={{ background: color }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs" style={{ color }}>
        {label} password
      </p>
    </div>
  );
}

/* ─── SIGNUP PAGE ─────────────────────────────────────────────────────── */
const Signup = () => {
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [error, setError]         = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading]     = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (name.trim().length < 2)   errs.name    = "At least 2 characters required.";
    if (password.length < 6)      errs.password = "At least 6 characters required.";
    if (password !== confirm)     errs.confirm  = "Passwords don't match.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await register(name, email, password);
      if (result.success) {
        navigate("/profile");
      } else {
        setError(result.error || "Signup failed. Please try again.");
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
        setError(result.error || "Google signup failed.");
      }
    } catch {
      setError("Google signup failed. Please try again.");
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
              Start learning.
            </h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Create your account and join the exchange.
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
              onError={() => setError("Google Signup Failed")}
              disabled={loading}
            />
          </div>

          <Divider label="or sign up with email" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            {/* Name */}
            <FormField label="Full name" id="name" error={fieldErrors.name}>
              <InputField
                id="name"
                type="text"
                icon={User}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
                }}
                placeholder="Alex Morgan"
                required
                disabled={loading}
                autoComplete="name"
              />
            </FormField>

            {/* Email */}
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

            {/* Password */}
            <FormField label="Password" id="password" error={fieldErrors.password}>
              <InputField
                id="password"
                type={showPw ? "text" : "password"}
                icon={Lock}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                }}
                placeholder="Create a strong password"
                required
                disabled={loading}
                autoComplete="new-password"
                right={<EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />}
              />
              <PasswordStrength password={password} />
            </FormField>

            {/* Confirm password */}
            <FormField label="Confirm password" id="confirm" error={fieldErrors.confirm}>
              <InputField
                id="confirm"
                type={showCf ? "text" : "password"}
                icon={Lock}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (fieldErrors.confirm) setFieldErrors((p) => ({ ...p, confirm: "" }));
                }}
                placeholder="Repeat your password"
                required
                disabled={loading}
                autoComplete="new-password"
                right={<EyeToggle show={showCf} onToggle={() => setShowCf((v) => !v)} />}
              />
            </FormField>

            <PrimaryButton loading={loading} label="Create account" loadingLabel="Creating account…" />
          </form>

          {/* Trust message */}
          <p
            className="text-xs text-center mt-5 leading-relaxed"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            No spam. No algorithms. Just people.
          </p>

          {/* Footer link */}
          <p className="text-sm text-center mt-4" style={{ color: "hsl(var(--muted-foreground))" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold hover:underline transition-colors"
              style={{ color: "hsl(var(--primary))" }}
            >
              Sign in
            </Link>
          </p>

          {/* Terms */}
          <p
            className="text-[11px] text-center mt-5 leading-relaxed"
            style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}
          >
            By creating an account, you agree to our{" "}
            <a href="#" className="underline hover:opacity-70">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="underline hover:opacity-70">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;