import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { CustomButton } from "@/components/CustomButton";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(name, email, password);
      if (result.success) {
        // New signup always goes to profile
        navigate("/profile");
      } else {
        setError(result.error || "Signup failed");
      }
    } catch (err) {
      setError("An error occurred during signup");
      console.error("Signup error:", err);
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
            <h1 className="mb-2 text-3xl font-bold font-heading gradient-text">Join Skillfinix</h1>
            <p className="text-muted-foreground">Start trading skills today</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 text-sm border rounded-lg bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 transition-all border outline-none h-11 bg-muted/50 border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="John Doe"
                  disabled={loading}
                  minLength={2}
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-foreground">Password</label>
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
                  minLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground">At least 6 characters</p>
            </div>

            <CustomButton
              type="submit"
              variant="gradient"
              className="w-full mt-2"
              size="lg"
              isLoading={loading}
              rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
            >
              {loading ? "Creating account..." : "Create Account"}
            </CustomButton>
          </form>

          <div className="mt-6 text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;