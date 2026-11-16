import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
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
    { label: "Weak", color: "hsl(var(--destructive))", width: "25%" },
    { label: "Fair", color: "hsl(var(--warning))", width: "50%" },
    { label: "Good", color: "hsl(var(--info))", width: "75%" },
    { label: "Strong", color: "hsl(var(--success))", width: "100%" },
  ];

  const { label, color, width } = levels[Math.max(0, score - 1)];

  return (
    <div className="space-y-1 pt-1">
      <div className="h-1 rounded-full overflow-hidden bg-muted">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: "0%" }}
          animate={{ width }}
          style={{ background: color }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
      <p className="text-[11px] font-medium" style={{ color }}>
        {label} password
      </p>
    </div>
  );
}

/* ─── SIGNUP PAGE ─────────────────────────────────────────────────────── */
const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (name.trim().length < 2) errs.name = "At least 2 characters required.";
    if (password.length < 6) errs.password = "At least 6 characters required.";
    if (password !== confirm) errs.confirm = "Passwords don't match.";
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
    <div className="h-screen overflow-hidden flex bg-background">
      <BrandPanel />

      {/* Right — form panel scrolls internally on short viewports */}
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
                Start learning
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Create your account and join the skill exchange network.
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
                onError={() => setError("Google Signup Failed")}
                disabled={loading}
              />
            </div>

            <Divider label="or sign up with email" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
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
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </FormField>

              {/* Password */}
              <FormField
                label="Password"
                id="password"
                error={fieldErrors.password}
              >
                <InputField
                  id="password"
                  type={showPw ? "text" : "password"}
                  icon={Lock}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors((p) => ({ ...p, password: "" }));
                  }}
                  placeholder="Create a password (min 6 chars)"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  right={
                    <EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />
                  }
                />
                <PasswordStrength password={password} />
              </FormField>

              {/* Confirm password */}
              <FormField
                label="Confirm password"
                id="confirm"
                error={fieldErrors.confirm}
              >
                <InputField
                  id="confirm"
                  type={showCf ? "text" : "password"}
                  icon={Lock}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (fieldErrors.confirm)
                      setFieldErrors((p) => ({ ...p, confirm: "" }));
                  }}
                  placeholder="Repeat your password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  right={
                    <EyeToggle show={showCf} onToggle={() => setShowCf((v) => !v)} />
                  }
                />
              </FormField>

              <div className="pt-2">
                <PrimaryButton
                  loading={loading}
                  label="Create free account"
                  loadingLabel="Creating account…"
                />
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-border/60 text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
