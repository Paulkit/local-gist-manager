"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Gist } from "../types/gist";
import CodeSyntaxHighlighter from "./SyntaxHighlighter";
import QuickActions from "./QuickActions";
import { getGistDetails, updateGist } from "../utils/api";
import "./textarea-fix.css";
// Import Lucide icons
import { 
  FileText, 
  Edit2, 
  Save, 
  X, 
  Clock, 
  Eye, 
  EyeOff, 
  Code, 
  CheckCircle,
  Calendar,
  FileCode,
  ExternalLink,
  Lock,
  Unlock
} from "lucide-react";

interface GistItemProps {
  gist: Gist;
  token: string;
  onUpdate: (gistId: string, description: string) => Promise<void>;
  onDelete: (gistId: string) => void;
  onGistUpdate?: (updatedGist: Gist) => void;
}

const GistItem = ({ gist, token, onUpdate, onDelete, onGistUpdate }: GistItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(gist.description || "");
  const [showFiles, setShowFiles] = useState(true); // Show all files by default if more than 1
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullGist, setFullGist] = useState<Gist>(gist);
  const [loadingContent, setLoadingContent] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSavingContent, setIsSavingContent] = useState(false);

  // Add state for editing filename
  const [editingFilename, setEditingFilename] = useState<string | null>(null);
  const [newFilename, setNewFilename] = useState("");

  // State for adding new file
  const [showAddFile, setShowAddFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");

  // Sync fullGist with gist prop when gist changes
  useEffect(() => {
    setFullGist(gist);
    setEditDescription(gist.description || "");
    setShowFiles(true); // Show all files by default if more than 1
    setEditingFileId(null);
    setEditingContent("");
  }, [gist]);

  // Fetch full gist content when component mounts or when showFiles changes
  useEffect(() => {
    const fetchFullContent = async () => {
      if (!fullGist.files[Object.keys(fullGist.files)[0]]?.content) {
        setLoadingContent(true);
        try {
          const detailedGist = await getGistDetails(token, gist.id);
          setFullGist(detailedGist);
        } catch (error) {
          console.error("Failed to fetch gist content:", error);
        } finally {
          setLoadingContent(false);
        }
      }
    };

    fetchFullContent();
  }, [token, gist.id, fullGist.files]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(gist.id, editDescription);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed in component:", err);
    } finally {
      setIsUpdating(false);
    }
  };
  const handleCancel = () => {
    setEditDescription(gist.description || "");
    setIsEditing(false);
  };
  // Enhanced real-time content editing
  const handleEditContent = (filename: string, content: string) => {
    setEditingFileId(filename);
    setEditingContent(content);
  };

  // In the textarea, use a simple onChange handler:
  // onChange={e => setEditingContent(e.target.value)}
  // ...existing code...

  const handleSaveContent = async (contentToSave: string = editingContent) => {
    if (!editingFileId) return;
    setIsSavingContent(true);
    try {
      const files = {
        [editingFileId]: {
          content: contentToSave
        }
      };
      const updatedGist = await updateGist(token, gist.id, { files });
      setFullGist(updatedGist);
      onGistUpdate?.(updatedGist);
      // Do NOT clear editing state after auto-save, so user can keep typing
      // (do not call setEditingFileId(null) or setEditingContent("") here)
    } catch (error) {
      console.error("Failed to save content:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSavingContent(false);
    }
  };
  const handleCancelContentEdit = () => {
    setEditingFileId(null);
    setEditingContent("");
  };

  // Handler to start editing filename
  const handleEditFilename = (filename: string) => {
    setEditingFilename(filename);
    setNewFilename(filename);
  };

  // Handler to save filename change
  const handleSaveFilename = async (oldFilename: string) => {
    if (!newFilename.trim() || newFilename === oldFilename) {
      setEditingFilename(null);
      return;
    }
    // Update filename in fullGist and on GitHub
    const updatedFiles = { ...fullGist.files };
    updatedFiles[newFilename] = { ...updatedFiles[oldFilename], filename: newFilename };
    delete updatedFiles[oldFilename];
    // Prepare payload for GitHub API: only { content } for unchanged, { content, filename } for renamed
    const filesPayload: { [key: string]: { content: string; filename?: string } } = {};
    Object.keys(updatedFiles).forEach((fname) => {
      if (fname === newFilename) {
        filesPayload[oldFilename] = { filename: newFilename, content: updatedFiles[newFilename].content || "" };
      } else {
        filesPayload[fname] = { content: updatedFiles[fname].content || "" };
      }
    });
    setLoadingContent(true);
    try {
      const updatedGist = await updateGist(token, gist.id, { files: filesPayload });
      setFullGist(updatedGist);
      onGistUpdate?.(updatedGist);
    } catch (error) {
      setFullGist(fullGist);
      alert('Failed to update filename on GitHub.');
    } finally {
      setEditingFilename(null);
      setLoadingContent(false);
    }
  };

  // Handler to cancel filename edit
  const handleCancelFilename = () => {
    setEditingFilename(null);
  };

  // Handler to add a new file to an empty gist
  const handleAddFile = () => {
    setShowAddFile(true);
    setNewFileName("");
    setNewFileContent("");
  };
  const handleSaveNewFile = async () => {
    if (!newFileName.trim()) return;
    setIsSavingContent(true);
    try {
      const files = {
        [newFileName]: { content: newFileContent }
      };
      const updatedGist = await updateGist(token, gist.id, { files });
      setFullGist(updatedGist);
      onGistUpdate?.(updatedGist);
      setShowAddFile(false);
      setNewFileName("");
      setNewFileContent("");
    } catch (error) {
      alert("Failed to add file. Please try again.");
    } finally {
      setIsSavingContent(false);
    }
  };
  const handleCancelAddFile = () => {
    setShowAddFile(false);
    setNewFileName("");
    setNewFileContent("");
  };

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
    };
  }, []);

  const files = Object.values(fullGist.files);
  const fileCount = files.length;
  const hasNoFiles = fileCount === 0;
  const primaryFile = fileCount > 0 ? files[0] : undefined;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-500 font-medium"
                placeholder="Gist description"
              /><div className="flex gap-2">                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <Clock className="animate-spin mr-2 h-3 w-3 text-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} className="mr-1" /> Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors flex items-center"
                >
                  <X size={14} className="mr-1" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-slate-900 mb-1 truncate">
                {gist.description || "Untitled Gist"}
              </h3>              <div className="flex items-center text-sm text-slate-500 space-x-4">
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" /> {formatDate(gist.updated_at)}
                </span>
                {gist.public ? (
                  <span className="flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <Unlock size={12} className="mr-1" /> Public
                  </span>
                ) : (
                  <span className="flex items-center px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                    <Lock size={12} className="mr-1" /> Secret
                  </span>
                )}
                <span className="flex items-center">
                  <FileText size={14} className="mr-1" /> {fileCount} file{fileCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>        {!isEditing && (
          <QuickActions
            gist={fullGist}
            onEdit={() => setIsEditing(true)}
            onDelete={() => onDelete(gist.id)}
          />
        )}
      </div>

      {/* Files */}
      <div className="space-y-3">
        {hasNoFiles ? (
          showAddFile ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden p-6 flex flex-col items-center">
              <input
                type="text"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                placeholder="Filename (e.g. example.txt)"
                className="mb-3 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-500 font-medium w-full max-w-xs"
                autoFocus
              />
              <textarea
                value={newFileContent}
                onChange={e => setNewFileContent(e.target.value)}
                placeholder="Add file content..."
                className="mb-3 w-full max-w-xs h-32 p-3 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900 placeholder-slate-500 font-medium"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNewFile}
                  disabled={isSavingContent}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isSavingContent ? (
                    <>
                      <Clock className="animate-spin mr-2 h-3 w-3 text-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} className="mr-1" /> Save File
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelAddFile}
                  disabled={isSavingContent}
                  className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors flex items-center"
                >
                  <X size={14} className="mr-1" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-slate-500">This gist has no files yet.</p>
              <button
                onClick={handleAddFile}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit2 size={18} className="mr-2" /> Add File
              </button>
            </div>
          )
        ) : (
          <React.Fragment>
            {/* Primary file preview */}
            {primaryFile && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="font-mono text-sm text-slate-700 cursor-pointer"
                      onDoubleClick={() => !editingFileId && handleEditFilename(primaryFile.filename)}
                    >
                      {editingFilename === primaryFile.filename ? (
                        <input
                          type="text"
                          value={newFilename}
                          onChange={e => setNewFilename(e.target.value)}
                          onBlur={() => handleSaveFilename(primaryFile.filename)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveFilename(primaryFile.filename);
                            if (e.key === 'Escape') handleCancelFilename();
                          }}
                          className="font-mono text-sm text-slate-700 border-b border-blue-400 bg-white focus:outline-none focus:border-blue-600 px-1"
                          autoFocus
                          style={{ minWidth: '6em' }}
                        />
                      ) : (
                        primaryFile.filename
                      )}
                    </span>                {primaryFile.language && (
                      <span className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-200 rounded flex items-center">
                        <Code size={10} className="mr-1" /> {primaryFile.language}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">
                      {primaryFile.size} bytes
                    </span>                <button
                    onClick={() => handleEditContent(primaryFile.filename, primaryFile.content || "")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    disabled={editingFileId === primaryFile.filename}
                  >
                  </button>                {fileCount > 1 && (
                    <button
                      onClick={() => setShowFiles(!showFiles)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                      {showFiles ? (
                        <>
                          <EyeOff size={12} className="mr-1" /> Hide {fileCount - 1} more
                        </>
                      ) : (
                        <>
                          <Eye size={12} className="mr-1" /> Show {fileCount - 1} more
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>            <div className="max-h-[50vh] overflow-auto">
                {loadingContent ? (
                  <div className="flex items-center justify-center py-8 text-slate-500">
                    <Clock className="animate-spin mr-2 h-5 w-5" />
                    Loading content...
                  </div>
                ) : editingFileId === primaryFile.filename ? (
                  <div className="p-4 space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full h-[35vh] p-3 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900 placeholder-slate-500 font-medium"
                      placeholder="Edit your code here..."
                    />
                    <div className="relative flex gap-2">
                      <button
                        onClick={() => handleSaveContent()}
                        disabled={isSavingContent}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        {isSavingContent ? (
                          <>
                            <Clock className="animate-spin mr-2 h-3 w-3 text-white" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={14} className="mr-1" /> Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelContentEdit}
                        disabled={isSavingContent}
                        className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors disabled:opacity-50 flex items-center"
                      >
                        <X size={14} className="mr-1" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : primaryFile.content === "" ? (
                  <div className="flex items-center justify-center py-8">
                    <button
                      onClick={() => handleEditContent(primaryFile.filename, "")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Edit2 size={16} className="mr-2" /> Add Content
                    </button>
                  </div>
                ) : (
                  <CodeSyntaxHighlighter
                    content={primaryFile.content || ""}
                    language={primaryFile.filename.split('.').pop() || "plaintext"}
                    onClick={() => handleEditContent(primaryFile.filename, primaryFile.content || "")}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    filename={primaryFile.filename}
                  />
                )}
              </div>
            </div>
          )}
          {/* Additional files */}
          {showFiles && fileCount > 1 && (
            <div className="space-y-3">
              {files.slice(1).map((file, index) => (
                <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className="font-mono text-sm text-slate-700 cursor-pointer"
                        onDoubleClick={() => !editingFileId && handleEditFilename(file.filename)}
                      >
                        {editingFilename === file.filename ? (
                          <input
                            type="text"
                            value={newFilename}
                            onChange={e => setNewFilename(e.target.value)}
                            onBlur={() => handleSaveFilename(file.filename)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveFilename(file.filename);
                              if (e.key === 'Escape') handleCancelFilename();
                            }}
                            className="font-mono text-sm text-slate-700 border-b border-blue-400 bg-white focus:outline-none focus:border-blue-600 px-1"
                            autoFocus
                            style={{ minWidth: '6em' }}
                          />
                        ) : (
                          file.filename
                        )}
                      </span>                    {file.language && (
                        <span className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-200 rounded flex items-center">
                          <Code size={10} className="mr-1" /> {file.language}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">
                        {file.size} bytes
                      </span>
                      <button
                        onClick={() => handleEditContent(file.filename, file.content || "")}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                        disabled={editingFileId === file.filename}
                      >
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[60vh] overflow-auto">
                    {loadingContent ? (
                      <div className="flex items-center justify-center py-8 text-slate-500">
                        <Clock className="animate-spin mr-2 h-5 w-5" />
                        Loading content...
                      </div>
                    ) : editingFileId === file.filename ? (
                      <div className="p-4 space-y-3">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full h-[55vh] p-3 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900 placeholder-slate-500 font-medium"
                          placeholder="Edit your code here..."
                        />
                        <div className="relative flex gap-2">
                          <button
                            onClick={() => handleSaveContent()}
                            disabled={isSavingContent}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                          >
                            {isSavingContent ? (
                              <>
                                <Clock className="animate-spin mr-2 h-3 w-3 text-white" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={14} className="mr-1" /> Save Changes
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCancelContentEdit}
                            disabled={isSavingContent}
                            className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors disabled:opacity-50 flex items-center"
                          >
                            <X size={14} className="mr-1" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : file.content === "" ? (
                      <div className="flex items-center justify-center py-8">
                        <button
                          onClick={() => handleEditContent(file.filename, "")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Edit2 size={16} className="mr-2" /> Add Content
                        </button>
                      </div>
                    ) : (
                      <CodeSyntaxHighlighter
                        content={file.content || ""}
                        language={file.filename.split('.').pop() || "plaintext"}
                        onClick={() => handleEditContent(file.filename, file.content || "")}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        filename={file.filename}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </React.Fragment>)}
      </div>
      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <a
          href={gist.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
        >
          View on GitHub
          <ExternalLink size={14} className="ml-1" />
        </a>
      </div>
    </div>
  )
};

export default GistItem;
