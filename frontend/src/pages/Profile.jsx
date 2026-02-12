// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapPin, Edit, Save, X, Camera, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CustomButton } from "@/components/CustomButton";
import { motion } from "framer-motion";
import api from "@/api/axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const isNewProfile = !user?.bio && (!user?.skills || user.skills.length === 0);

  const [isEditing, setIsEditing] = useState(isNewProfile); 
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null); // Track current avatar separately
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    location: "",
    bio: "",
    skills: "",
    interests: "",
    avatar: null,
  });

  // Update currentAvatar whenever user changes
  useEffect(() => {
    if (user?.avatar) {
      setCurrentAvatar(user.avatar);
    }
  }, [user?.avatar]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        role: user.role || "Student", 
        location: user.location === "Earth" ? "" : user.location,
        bio: user.bio || "",
        skills: user.skills ? user.skills.join(", ") : "",
        interests: user.interests ? user.interests.join(", ") : "",
        avatar: null,
      });
      if (isNewProfile) setIsEditing(true);
    }
  }, [user, isNewProfile]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Clean up old preview URL
    if (previewImage && previewImage.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }

    // Set the file in form data
    setFormData({ ...formData, avatar: file });

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    
    console.log('✅ Avatar selected:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("role", formData.role); 
      data.append("location", formData.location); 
      data.append("bio", formData.bio);
      data.append("skills", formData.skills);
      data.append("interests", formData.interests);
      
      // Only append avatar if a new file was selected
      if (formData.avatar instanceof File) {
        data.append("avatar", formData.avatar);
        console.log("📤 Uploading new avatar to Cloudinary:", formData.avatar.name);
      }

      const response = await api.put("/users/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Profile update response:", response.data);
      console.log("🖼️ New avatar URL:", response.data.avatar);
      
      // CRITICAL: Update local avatar state immediately
      if (response.data.avatar) {
        setCurrentAvatar(response.data.avatar);
      }
      
      // Update the auth context with new user data
      updateProfile(response.data);
      
      setIsEditing(false);
      
      // Clean up preview
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(null);
      
      // Reset avatar in form
      setFormData(prev => ({ ...prev, avatar: null }));
      
      // Navigate if new profile
      if(isNewProfile) {
        // Small delay to ensure state updates
        setTimeout(() => navigate('/'), 100);
      }

    } catch (error) {
      console.error("❌ Failed to update profile", error);
      console.error("❌ Error response:", error.response?.data);
      alert(error.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    
    // Clean up preview
    if (previewImage && previewImage.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    
    if (user) {
      setFormData({
        name: user.name || "",
        role: user.role || "Student",
        location: user.location === "Earth" ? "" : user.location,
        bio: user.bio || "",
        skills: user.skills ? user.skills.join(", ") : "",
        interests: user.interests ? user.interests.join(", ") : "",
        avatar: null,
      });
    }
  };

  // Helper function to generate a default avatar using UI Avatars
  const getDefaultAvatar = (name) => {
    if (!name) return "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=200&bold=true";
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&size=200&bold=true`;
  };

  // Get avatar URL - works with both Cloudinary URLs and other sources
  const getAvatarUrl = () => {
    // Priority 1: Show preview if user selected a new image
    if (previewImage) {
      console.log('🖼️ Showing preview image');
      return previewImage;
    }
    
    // Priority 2: Show current avatar from local state (most recent)
    if (currentAvatar && currentAvatar.startsWith('http')) {
      console.log('🖼️ Showing current avatar from state:', currentAvatar);
      return currentAvatar;
    }
    
    // Priority 3: Show existing user avatar from context
    if (user?.avatar && user.avatar.startsWith('http')) {
      console.log('🖼️ Showing user avatar from context:', user.avatar);
      return user.avatar;
    }
    
    // Priority 4: Generate default avatar
    console.log('🖼️ Showing default avatar');
    return getDefaultAvatar(user?.name);
  };

  return (
    <div className="max-w-4xl min-h-screen pb-12 mx-auto">
      {/* Welcome Message for New Users */}
      {isNewProfile && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 mb-6 text-center border-2 shadow-sm bg-card border-primary/20 rounded-2xl"
        >
          <h2 className="mb-2 text-2xl font-bold text-foreground">Welcome, {user?.name}! 🎉</h2>
          <p className="mb-6 text-muted-foreground">
            Let's set up your profile so others can find you. 
            <br />Add a photo and your skills to start bartering.
          </p>
          
          <div className="flex justify-center gap-4">
             <CustomButton variant="outline" onClick={() => navigate('/')}>
               Skip for Now
             </CustomButton>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border bg-card rounded-2xl border-border">
        <div className="h-32 gradient-hero" />
        
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 -mt-12 sm:flex-row sm:items-end">
            
            {/* Avatar Section with Upload UI */}
            <div className="relative group">
              <div className="relative">
                <img 
                  key={currentAvatar || user?.avatar || 'default'} // Force re-render when avatar changes
                  src={getAvatarUrl()} 
                  alt="Profile" 
                  className="object-cover bg-white border-4 shadow-lg w-28 h-28 rounded-2xl border-card"
                  onLoad={() => console.log('✅ Avatar image loaded successfully')}
                  onError={(e) => {
                    console.error('❌ Image load error, falling back to default avatar');
                    e.target.onerror = null;
                    e.target.src = getDefaultAvatar(user?.name);
                  }}
                />
                
                {isEditing && (
                  <>
                    {/* Camera Icon Overlay */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity opacity-0 cursor-pointer bg-black/60 rounded-2xl group-hover:opacity-100"
                    >
                      <Camera className="w-8 h-8 text-white" />
                      <span className="text-xs font-medium text-white">Change Photo</span>
                    </button>

                    {/* Visual indicator */}
                    <div className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 border-2 rounded-full bg-primary border-card">
                      <Camera className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </>
                )}
              </div>
              
              {/* File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              />

              {/* Show file name if selected */}
              {isEditing && formData.avatar && (
                <p className="mt-2 text-xs text-center text-green-600 dark:text-green-400">
                  ✓ {formData.avatar.name}
                </p>
              )}
            </div>

            {/* Name & Headline */}
            <div className="flex-1 space-y-2">
              {isEditing ? (
                <div className="space-y-3">
                  {/* Name Input */}
                  <input 
                    className="w-full max-w-sm pb-1 text-2xl font-bold bg-transparent border-b border-primary focus:outline-none text-foreground placeholder:text-muted-foreground/50"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Your Name"
                    required
                  />
                  
                  {/* Headline Input */}
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input 
                      className="w-full max-w-sm pb-1 text-sm bg-transparent border-b border-border focus:outline-none focus:border-primary text-muted-foreground placeholder:text-muted-foreground/50"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      placeholder="Headline (e.g. Student, Developer)"
                    />
                  </div>

                  {/* Location Input */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input 
                      className="w-full max-w-sm pb-1 text-sm bg-transparent border-b border-border focus:outline-none focus:border-primary text-muted-foreground placeholder:text-muted-foreground/50"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Location (City, Country)"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold font-heading text-foreground">{user?.name}</h1>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    {user?.role || "Student"}
                  </p>
                  {user?.location && user?.location !== "Earth" && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {user.location}
                    </p>
                  )}
                </>
              )}
            </div>
            
            <div className="flex gap-2">
                <CustomButton 
                  variant={isEditing ? "gradient" : "outline"} 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  isLoading={loading}
                  disabled={loading}
                  leftIcon={isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                >
                  {isEditing ? (isNewProfile ? "Complete & Go Home" : "Save Changes") : "Edit Profile"}
                </CustomButton>
            </div>
            
            {isEditing && !isNewProfile && (
              <CustomButton 
                variant="ghost" 
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="w-4 h-4" />
              </CustomButton>
            )}
          </div>

          {/* Rest of Profile */}
          <div className="mt-8">
            <h3 className="mb-2 text-sm font-medium text-foreground">About Me</h3>
            {isEditing ? (
              <textarea 
                className="w-full p-3 border rounded-xl bg-muted/50 focus:outline-primary min-h-[100px] text-foreground resize-none"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="leading-relaxed text-foreground">{user?.bio || "No bio yet."}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
            {/* Skills */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Skills (Can Teach)</h3>
              {isEditing ? (
                 <input 
                  className="w-full p-3 border rounded-xl bg-muted/50 focus:outline-primary text-foreground"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="e.g. React, Python (Comma separated)"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.map((skill, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-lg bg-primary/10 text-primary">{skill}</span>
                  ))}
                  {(!user?.skills || user.skills.length === 0) && <span className="text-sm text-muted-foreground">None listed.</span>}
                </div>
              )}
            </div>

            {/* Interests */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Interests (Wants to Learn)</h3>
              {isEditing ? (
                 <input 
                  className="w-full p-3 border rounded-xl bg-muted/50 focus:outline-primary text-foreground"
                  value={formData.interests}
                  onChange={(e) => setFormData({...formData, interests: e.target.value})}
                  placeholder="e.g. Design, Marketing (Comma separated)"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.interests?.map((int, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-lg bg-secondary/10 text-secondary">{int}</span>
                  ))}
                  {(!user?.interests || user.interests.length === 0) && <span className="text-sm text-muted-foreground">None listed.</span>}
                </div>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Profile;