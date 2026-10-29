import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Image as ImageIcon } from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import api from "@/api/axios";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    visibility: "public",
    thumbnail: ""
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, catRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get("/courses/categories")
        ]);
        
        const c = courseRes.data;
        setFormData({
          title: c.title || "",
          description: c.description || "",
          category: c.category || "",
          visibility: c.visibility || "public",
          thumbnail: c.thumbnail || ""
        });
        
        let cats = catRes.data || [];
        if (!cats.includes(c.category) && c.category) {
            cats = [...cats, c.category];
        }
        setCategories(cats);
        
      } catch (error) {
        toast({
          title: "Error fetching course details",
          description: error?.response?.data?.message || "Please try again later.",
          variant: "destructive"
        });
        navigate("/studio/content");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Title and Category are required fields.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      await api.put(`/courses/${id}`, formData); // The router uses PUT, but backend handles partial gracefully
      toast({
        title: "Course Updated",
        description: "Your changes have been saved successfully.",
      });
      navigate("/studio/content");
    } catch (error) {
      toast({
        title: "Error saving changes",
        description: error?.response?.data?.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/studio/content")}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Edit Details</h1>
            <p className="text-muted-foreground text-sm">Update your video information</p>
          </div>
        </div>
        <CustomButton onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </CustomButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title <span className="text-red-500">*</span></Label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Add a catchy title..."
              className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground text-right">{formData.title.length}/100</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell viewers about your video..."
              className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none min-h-[160px] resize-y"
              maxLength={5000}
            />
          </div>

          <div className="space-y-2">
            <Label>Category <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.category} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
            >
              <SelectTrigger className="w-full h-12 bg-card border border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                    categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))
                ) : (
                    <SelectItem value={formData.category || "Uncategorized"}>{formData.category || "Uncategorized"}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          
          {/* Thumbnail Preview */}
          <div className="space-y-2">
             <Label>Thumbnail Preview</Label>
             <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted border border-border flex flex-col items-center justify-center relative group">
                {formData.thumbnail ? (
                   <img src={formData.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : (
                   <div className="flex flex-col items-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs">No thumbnail</span>
                   </div>
                )}
                {/* Note: Changing thumbnail file upload not explicitly requested, keeping it simple as a title/desc/visibility edit for now */}
             </div>
             <p className="text-xs text-muted-foreground mt-2">
               Thumbnails are set during upload. You can update details here.
             </p>
          </div>

          {/* Visibility Toggle */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <div>
               <h3 className="font-medium text-sm">Visibility</h3>
               <p className="text-xs text-muted-foreground mt-1">Control who can see this video.</p>
            </div>
            
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Label htmlFor="visibility-toggle" className="cursor-pointer">
                 {formData.visibility === "public" ? "Public" : "Private"}
              </Label>
              <Switch 
                 id="visibility-toggle"
                 checked={formData.visibility === "public"}
                 onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visibility: checked ? "public" : "private" }))}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EditCourse;
