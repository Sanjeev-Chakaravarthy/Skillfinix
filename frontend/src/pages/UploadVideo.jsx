import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, X, FileVideo, Check, AlertCircle, Video, 
  Image as ImageIcon, Globe, Lock, Eye, List, BarChart 
} from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios"; 
import { useNavigate } from "react-router-dom";

const UploadVideo = () => {
  // Steps: 0=Upload, 1=Details, 2=Elements, 3=Visibility
  const [step, setStep] = useState(0);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  
  // Thumbnail State
  const [thumbnailMode, setThumbnailMode] = useState("auto"); // 'auto' or 'custom'
  const [customThumbnail, setCustomThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const thumbnailInputRef = useRef(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    tags: "",
    visibility: "public"
  });

  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, []);

  // --- Handlers ---
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid video file.");
      return;
    }
    setSelectedFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setUploadStatus("idle");
    setErrorMessage("");
    setStep(1); // Go to Details
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setThumbnailMode("custom");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title || !formData.category) return;

    setUploadStatus("uploading");
    setUploadProgress(0);
    setErrorMessage(""); // Clear previous errors
    
    const data = new FormData();
    data.append("video", selectedFile);
    
    if (thumbnailMode === "custom" && customThumbnail) {
      data.append("thumbnail", customThumbnail);
    }

    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("level", formData.level);
    data.append("tags", formData.tags);
    data.append("visibility", formData.visibility);

    try {
      console.log("📤 Starting upload...");
      console.log("Video file:", selectedFile.name, selectedFile.size, "bytes");
      
      const response = await api.post("/courses", data, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 600000, // 10 mins
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const realProgress = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress(realProgress);
          }
        }
      });

      setUploadProgress(100);
      setUploadStatus("success");
      console.log("✅ Upload successful!", response.data);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      
      let errorMsg = "Upload failed. Please try again.";
      
      if (error.response) {
        console.error("Server error:", error.response.status, error.response.data);
        errorMsg = error.response.data?.message || `Server error (${error.response.status})`;
      } else if (error.code === "ECONNABORTED") {
        errorMsg = "Upload timed out. The video may be too large. Try a smaller file.";
      } else if (error.request) {
        console.error("No response from server");
        errorMsg = "Cannot connect to server. Please check if the backend is running.";
      } else {
        errorMsg = error.message || errorMsg;
      }
      
      setErrorMessage(errorMsg);
      setUploadStatus("error");
    }
  };

  // --- Render Steps ---

  // STEP 0: Drag & Drop
  if (step === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl p-10 text-center border shadow-2xl bg-card rounded-2xl border-border"
        >
          <div 
            className={cn(
              "flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-xl transition-colors cursor-pointer",
              dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex items-center justify-center w-32 h-32 mb-6 rounded-full bg-muted">
              <Upload className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Upload videos</h2>
            <p className="mt-2 text-sm text-muted-foreground">Drag and drop video files to upload</p>
            <CustomButton className="mt-6" variant="gradient">Select Files</CustomButton>
            <input ref={inputRef} type="file" accept="video/*" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
          </div>
        </motion.div>
      </div>
    );
  }

  // WIZARD LAYOUT (Steps 1, 2, 3)
  if (step > 0 && uploadStatus !== "success") {
    return (
      <div className="max-w-6xl min-h-screen px-4 pb-12 mx-auto mt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="max-w-md text-xl font-bold truncate font-heading text-foreground">{formData.title || selectedFile?.name}</h1>
          <div className="flex gap-2">
             <CustomButton variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 1}>Back</CustomButton>
             
             {step < 3 ? (
               <CustomButton variant="gradient" onClick={() => setStep(step + 1)}>Next</CustomButton>
             ) : (
               <CustomButton 
                 variant="gradient" 
                 onClick={handleUpload}
                 isLoading={uploadStatus === "uploading"}
                 disabled={!formData.title || !formData.category || uploadStatus === "uploading"}
               >
                 {uploadStatus === "uploading" ? "Uploading..." : "Publish"}
               </CustomButton>
             )}
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 pb-4 mb-8 text-sm font-medium border-b border-border">
           {["Details", "Video Elements", "Visibility"].map((label, idx) => {
             const stepNum = idx + 1;
             const isActive = step === stepNum;
             const isCompleted = step > stepNum;
             return (
               <div key={label} className={cn("flex items-center gap-2 px-3 py-1 rounded-full transition-colors", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
                 <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs", isActive ? "bg-primary text-primary-foreground" : isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                   {isCompleted ? <Check className="w-3 h-3" /> : stepNum}
                 </div>
                 {label}
                 {idx < 2 && <div className="w-8 h-px ml-2 bg-border" />}
               </div>
             )
           })}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT COLUMN (Forms) */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* STEP 1: DETAILS */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="p-6 space-y-5 border bg-card rounded-xl border-border">
                   <h3 className="text-lg font-semibold">Details</h3>
                   
                   {/* Title */}
                   <div className="space-y-1">
                     <div className="flex justify-between">
                        <label className="text-xs font-medium uppercase text-muted-foreground">Title (Required)</label>
                        <span className="text-xs text-muted-foreground">{formData.title.length}/100</span>
                     </div>
                     <textarea 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-3 bg-transparent border rounded-lg outline-none border-border focus:border-primary min-h-[50px] resize-none"
                        placeholder="Add a title that describes your video"
                        maxLength={100}
                     />
                   </div>

                   {/* Description */}
                   <div className="space-y-1">
                     <label className="text-xs font-medium uppercase text-muted-foreground">Description</label>
                     <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full p-3 bg-transparent border rounded-lg outline-none border-border focus:border-primary min-h-[120px]"
                        placeholder="Tell viewers about your video"
                     />
                   </div>
                   
                   {/* Category */}
                   <div className="space-y-1">
                     <label className="text-xs font-medium uppercase text-muted-foreground">Category</label>
                     <input 
                       type="text"
                       value={formData.category}
                       onChange={(e) => setFormData({...formData, category: e.target.value})}
                       className="w-full p-3 bg-transparent border rounded-lg outline-none border-border focus:border-primary"
                       placeholder="e.g. Technology, Education, Gaming"
                     />
                   </div>
                </div>

                {/* Thumbnail Section */}
                <div className="p-6 space-y-4 border bg-card rounded-xl border-border">
                  <h3 className="text-lg font-semibold">Thumbnail</h3>
                  <p className="text-sm text-muted-foreground">Select or upload a picture that shows what's in your video.</p>
                  
                  <div className="flex gap-4">
                    {/* Upload Custom */}
                    <div 
                      onClick={() => thumbnailInputRef.current?.click()}
                      className={cn(
                        "flex flex-col items-center justify-center w-40 h-24 border cursor-pointer rounded-xl transition-all relative overflow-hidden",
                        thumbnailMode === "custom" ? "border-primary ring-2 ring-primary/20" : "border-border border-dashed hover:bg-muted/50"
                      )}
                    >
                       {thumbnailMode === "custom" && thumbnailPreview ? (
                         <img src={thumbnailPreview} alt="Preview" className="absolute inset-0 object-cover w-full h-full" />
                       ) : (
                         <>
                           <ImageIcon className="w-6 h-6 mb-1 text-muted-foreground"/>
                           <span className="text-xs text-muted-foreground">Upload file</span>
                         </>
                       )}
                       <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                    </div>

                    {/* Auto-Generated Option */}
                    <div 
                      onClick={() => setThumbnailMode("auto")}
                      className={cn(
                        "flex flex-col items-center justify-center w-40 h-24 border cursor-pointer rounded-xl transition-all relative overflow-hidden bg-muted/20",
                        thumbnailMode === "auto" ? "border-primary ring-2 ring-primary/20" : "border-border"
                      )}
                    >
                       <span className="z-10 text-xs text-muted-foreground">Auto-generated</span>
                       {/* Overlay to show selection */}
                       {thumbnailMode === "auto" && <div className="absolute inset-0 bg-primary/5" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: VIDEO ELEMENTS */}
            {step === 2 && (
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6 border bg-card rounded-xl border-border">
                  <h3 className="text-lg font-semibold">Video Elements</h3>
                  
                  {/* Tags */}
                  <div className="space-y-2">
                     <label className="flex items-center gap-2 text-sm font-medium"><List className="w-4 h-4"/> Tags</label>
                     <p className="text-xs text-muted-foreground">Tags can be useful if content in your video is commonly misspelled.</p>
                     <input 
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        className="w-full p-3 bg-transparent border rounded-lg outline-none border-border focus:border-primary"
                        placeholder="Add tags separated by comma (e.g. react, coding, tutorial)"
                     />
                  </div>

                  {/* Level */}
                  <div className="space-y-2">
                     <label className="flex items-center gap-2 text-sm font-medium"><BarChart className="w-4 h-4"/> Difficulty Level</label>
                     <select 
                        value={formData.level}
                        onChange={(e) => setFormData({...formData, level: e.target.value})}
                        className="w-full p-3 bg-transparent border rounded-lg outline-none border-border focus:border-primary text-foreground"
                     >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                     </select>
                  </div>
               </motion.div>
            )}

            {/* STEP 3: VISIBILITY */}
            {step === 3 && (
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6 border bg-card rounded-xl border-border">
                  <h3 className="text-lg font-semibold">Visibility</h3>
                  <p className="text-sm text-muted-foreground">Choose when to publish and who can see your video.</p>
                  
                  <div className="p-4 space-y-3 border border-border rounded-xl">
                     {/* Public */}
                     <label className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/30">
                        <input 
                          type="radio" 
                          name="visibility" 
                          value="public" 
                          checked={formData.visibility === "public"}
                          onChange={() => setFormData({...formData, visibility: "public"})}
                          className="mt-1"
                        />
                        <div>
                           <span className="flex items-center gap-2 text-sm font-medium"><Globe className="w-3 h-3"/> Public</span>
                           <p className="text-xs text-muted-foreground mt-0.5">Everyone can watch your video</p>
                        </div>
                     </label>

                     {/* Private */}
                     <label className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/30">
                        <input 
                          type="radio" 
                          name="visibility" 
                          value="private" 
                          checked={formData.visibility === "private"}
                          onChange={() => setFormData({...formData, visibility: "private"})}
                          className="mt-1"
                        />
                        <div>
                           <span className="flex items-center gap-2 text-sm font-medium"><Lock className="w-3 h-3"/> Private</span>
                           <p className="text-xs text-muted-foreground mt-0.5">Only you and people you choose can watch your video</p>
                        </div>
                     </label>
                  </div>
               </motion.div>
            )}

          </div>

          {/* RIGHT COLUMN (Sticky Preview) */}
          <div className="lg:col-span-1">
            <div className="sticky space-y-4 top-24">
               <div className="overflow-hidden border shadow-sm bg-card rounded-xl border-border">
                  {/* Video Player */}
                  <div className="relative flex items-center justify-center bg-black aspect-video">
                     {videoPreviewUrl ? (
                        <video src={videoPreviewUrl} controls className="object-contain w-full h-full" />
                     ) : (
                        <div className="text-xs text-muted-foreground">Processing...</div>
                     )}
                  </div>
                  
                  {/* Metadata Preview */}
                  <div className="p-4 space-y-4 bg-muted/10">
                     <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Video Link</p>
                        <p className="text-sm truncate cursor-pointer text-primary hover:underline">https://skillfinix.com/watch/...</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Filename</p>
                        <p className="text-sm truncate text-foreground">{selectedFile?.name}</p>
                     </div>
                  </div>
               </div>
               
               {/* Progress Bar (Only during upload) */}
               {uploadStatus === "uploading" && (
                  <div className="p-4 border bg-card rounded-xl border-border">
                     <div className="flex justify-between mb-2 text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                     </div>
                     <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div 
                           className="h-full bg-primary"
                           initial={{ width: 0 }}
                           animate={{ width: `${uploadProgress}%` }}
                        />
                     </div>
                     <p className="mt-2 text-xs text-center text-muted-foreground">Please do not close this tab.</p>
                  </div>
               )}

               {/* Error Message */}
               {uploadStatus === "error" && errorMessage && (
                  <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-xl">
                     <div className="flex items-start gap-3">
                        <AlertCircle className="flex-shrink-0 w-5 h-5 mt-0.5 text-red-500" />
                        <div className="flex-1">
                           <h4 className="text-sm font-semibold text-red-500">Upload Failed</h4>
                           <p className="mt-1 text-xs text-red-400">{errorMessage}</p>
                           <button 
                             onClick={() => { setUploadStatus("idle"); setErrorMessage(""); }}
                             className="mt-3 text-xs text-red-400 underline hover:text-red-300"
                           >
                             Try Again
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS STATE
  if (uploadStatus === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg p-8 text-center border shadow-xl bg-card rounded-2xl border-border"
        >
           <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-success/20">
              <Check className="w-10 h-10 text-success" />
           </div>
           <h2 className="text-2xl font-bold text-foreground">Published!</h2>
           <p className="mt-2 text-muted-foreground">Your video is now live.</p>
           
           <div className="flex gap-3 mt-8">
              <CustomButton variant="outline" onClick={() => navigate("/")} className="flex-1">Go to Home</CustomButton>
              <CustomButton variant="gradient" onClick={() => window.location.reload()} className="flex-1">Upload Another</CustomButton>
           </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default UploadVideo;