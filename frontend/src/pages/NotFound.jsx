import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { CustomButton } from "@/components/CustomButton";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="text-8xl font-heading font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-heading font-semibold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/"><CustomButton variant="gradient" leftIcon={<Home className="h-4 w-4" />}>Go Home</CustomButton></Link>
          <CustomButton variant="outline" onClick={() => window.history.back()} leftIcon={<ArrowLeft className="h-4 w-4" />}>Go Back</CustomButton>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
