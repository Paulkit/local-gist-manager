"use client";

import { useState } from "react";

interface CreateGistFormProps {
  onCreateGist: (gistData: {
    description: string;
    public: boolean;
    files: { [key: string]: { content: string } };
  }) => void;
  onCancel: () => void;
}

const CreateGistForm = ({ onCreateGist, onCancel }: CreateGistFormProps) => {
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [files, setFiles] = useState([{ filename: "", content: "" }]);

  const handleAddFile = () => {
    setFiles([...files, { filename: "", content: "" }]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleFileChange = (index: number, field: string, value: string) => {
    const updatedFiles = [...files];
    updatedFiles[index] = { ...updatedFiles[index], [field]: value };
    setFiles(updatedFiles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validFiles = files.filter(file => file.filename && file.content);
    if (validFiles.length === 0) {
      alert("Please add at least one file with both filename and content.");
      return;
    }

    const gistFiles = validFiles.reduce((acc, file) => {
      acc[file.filename] = { content: file.content };
      return acc;
    }, {} as { [key: string]: { content: string } });

    onCreateGist({
      description,
      public: isPublic,
      files: gistFiles,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Create New Gist</h2>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Gist description..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-slate-500 font-medium"
            style={{ color: '#000000' }}
          />
        </div>        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Visibility
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
            <label className={`flex items-center p-3 border rounded-lg transition-all ${!isPublic ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200'}`}>
              <input
                type="radio"
                name="visibility"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-slate-800 mr-2">Secret</span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">Private</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Only you can see this gist</p>
              </div>
            </label>
            
            <label className={`flex items-center p-3 border rounded-lg transition-all ${isPublic ? 'bg-green-50 border-green-300 shadow-sm' : 'bg-white border-slate-200'}`}>
              <input
                type="radio"
                name="visibility"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-slate-800 mr-2">Public</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">Visible</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Everyone can see this gist</p>
              </div>
            </label>
          </div>
        </div>

        {/* Files */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700">
              Files
            </label>
            <button
              type="button"
              onClick={handleAddFile}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add File
            </button>
          </div>
          
          <div className="space-y-4">
            {files.map((file, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">                  <input
                    type="text"
                    value={file.filename}
                    onChange={(e) => handleFileChange(index, "filename", e.target.value)}
                    placeholder="filename.extension"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-500 font-medium"
                  />
                  {files.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-3 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>                <textarea
                  value={file.content}
                  onChange={(e) => handleFileChange(index, "content", e.target.value)}
                  placeholder="File content..."
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm text-black placeholder-slate-500 font-medium"
                  style={{ color: '#000000' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            Create Gist
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGistForm;
