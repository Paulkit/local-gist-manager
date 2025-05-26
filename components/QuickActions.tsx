"use client";

import { useState } from "react";
import { Gist } from "../types/gist";
import { 
  MoreVertical, 
  Copy, 
  Link, 
  Edit2, 
  Trash2, 
  Check, 
  AlertCircle 
} from "lucide-react";

interface QuickActionsProps {
  gist: Gist;
  onEdit: () => void;
  onDelete: () => void;
}

const QuickActions = ({ gist, onEdit, onDelete }: QuickActionsProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);  const copyToClipboard = async (text: string) => {
    try {
      // Try the modern Clipboard API first, but with better error handling
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          // Show success feedback for modern API
          setCopySuccess("Copied!");
          setTimeout(() => setCopySuccess(null), 2000);
          return;
        } catch (clipboardError) {
          console.warn("Clipboard API failed, falling back to execCommand:", clipboardError);
          // Fall through to execCommand fallback
        }
      }
      
      // Fallback to execCommand for older browsers or non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        throw new Error('Fallback copy failed');
      }
      
      // Show success feedback for fallback method
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Show user feedback that copy failed
      setCopySuccess("Failed to copy");
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };
  const copyGistContent = async () => {
    const allContent = Object.values(gist.files)
      .map((file) => `// ${file.filename}\n${file.content || ""}`)
      .join("\n\n");
    await copyToClipboard(allContent);
    setShowDropdown(false);
  };

  const copyGistUrl = async () => {
    await copyToClipboard(gist.html_url);
    setShowDropdown(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this gist?")) {
      onDelete();
    }
    setShowDropdown(false);
  };
  return (
    <div className="relative">      {/* Success/Error Toast */}
      {copySuccess && (
        <div className="absolute -top-10 right-0 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg z-30 flex items-center">
          {copySuccess === "Copied!" ? 
            <Check size={12} className="mr-1" /> : 
            <AlertCircle size={12} className="mr-1" />
          }
          {copySuccess}
        </div>
      )}
      
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <div className="py-1">
              <button
                onClick={() => {
                  onEdit();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
              >
                <Edit2 className="w-4 h-4 mr-3" />
                Edit Description
              </button>
              
              <button
                onClick={copyGistContent}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
              >
                <Copy className="w-4 h-4 mr-3" />
                Copy Content
              </button>
              
              <button
                onClick={copyGistUrl}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
              >
                <Link className="w-4 h-4 mr-3" />
                Copy URL
              </button>
              
              <div className="border-t border-slate-100 my-1" />
              
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete Gist
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuickActions;
