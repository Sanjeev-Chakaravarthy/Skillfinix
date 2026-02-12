import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CustomButton } from "@/components/CustomButton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const settingsSections = [
  { id: "account", icon: User, label: "Account" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "privacy", icon: Shield, label: "Privacy" },
  { id: "appearance", icon: Palette, label: "Appearance" },
  { id: "language", icon: Globe, label: "Language" },
  { id: "billing", icon: CreditCard, label: "Billing" },
  { id: "help", icon: HelpCircle, label: "Help" },
];

const Settings = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("account");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
  });

  const handleSave = () => console.log("Settings saved");

  return (
    <div className="min-h-screen pb-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-8"
      >
        Settings
      </motion.h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 bg-card rounded-2xl border border-border p-2"
        >
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                activeSection === section.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <section.icon className="h-5 w-5" />
              {section.label}
            </button>
          ))}
          <div className="border-t border-border my-2" />
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-card rounded-2xl border border-border p-6"
        >
          {activeSection === "account" && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Account Settings
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full h-12 px-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full h-12 px-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Bio
                  </label>
                  <textarea
                    defaultValue={user?.bio}
                    rows={3}
                    className="w-full p-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>
              <CustomButton variant="gradient" onClick={handleSave}>
                Save Changes
              </CustomButton>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Notification Preferences
              </h2>
              {[
                { key: "email", label: "Email Notifications" },
                { key: "push", label: "Push Notifications" },
                { key: "marketing", label: "Marketing Emails" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                >
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors",
                      notifications[item.key]
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full bg-card shadow transition-transform",
                        notifications[item.key]
                          ? "translate-x-6"
                          : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!["account", "notifications"].includes(activeSection) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                {React.createElement(
                  settingsSections.find(
                    (s) => s.id === activeSection
                  )?.icon || User,
                  { className: "h-8 w-8 text-muted-foreground" }
                )}
              </div>
              <h3 className="text-lg font-medium text-foreground">
                {
                  settingsSections.find(
                    (s) => s.id === activeSection
                  )?.label
                }{" "}
                Settings
              </h3>
              <p className="text-muted-foreground mt-1">Coming soon</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
