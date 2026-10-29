import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import { cn } from "@/lib/utils";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Delete {itemName || "Item"}?</h2>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete the selected item and remove all its data from our servers.
          </p>
        </div>
        
        <div className="flex items-center justify-end gap-3 p-4 bg-muted/50 border-t border-border">
          <CustomButton 
            variant="outline" 
            onClick={onClose} 
            disabled={isDeleting}
          >
            Cancel
          </CustomButton>
          <CustomButton 
            className="bg-red-500 hover:bg-red-600 text-white min-w-[100px]"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Delete"}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
