import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { CustomButton } from "@/components/CustomButton";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Email/Pass Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        // Check if user needs to complete profile
        const user = result.user || {};
        const isNewUser = !user?.bio && (!user?.skills || user.skills.length === 0);
        
        if (isNewUser) {
          // New user - go to profile to complete setup
          navigate("/profile");
        } else {
          // Existing user - go to home
          navigate("/");
        }
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        // Check if user needs to complete profile
        const user = result.user || {};
        const isNewUser = !user?.bio && (!user?.skills || user.skills.length === 0);
        
        if (isNewUser) {
          // New user - go to profile to complete setup
          navigate("/profile");
        } else {
          // Existing user - go to home
          navigate("/");
        }
      } else {
        setError(result.error || "Google login failed");
      }
    } catch (err) {
      setError("Google login failed");
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden border shadow-xl bg-card rounded-2xl border-border"
      >
        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold font-heading gradient-text">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 text-sm border rounded-lg bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* GOOGLE BUTTON */}
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
              theme="filled_blue"
              shape="pill"
              width="320"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 transition-all border outline-none h-11 bg-muted/50 border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 transition-all border outline-none h-11 bg-muted/50 border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <CustomButton
              type="submit"
              variant="gradient"
              className="w-full mt-2"
              size="lg"
              isLoading={loading}
              rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
            >
              {loading ? "Signing in..." : "Sign In"}
            </CustomButton>
          </form>

          <div className="mt-6 text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;