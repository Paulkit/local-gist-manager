"use client";

import { useEffect, useState } from "react";
import { Gist } from "../types/gist";
import GistItem from "./GistItem";
import { removeTokenFromCookie } from '../utils/cookie-utils';
import { X } from 'lucide-react';

interface GistListProps {
  gists: Gist[];
  token: string;
  onUpdate: (gistId: string, description: string) => Promise<void>;
  onDelete: (gistId: string) => void;
  onGistUpdate?: (updatedGist: Gist) => void;
  autoSave?: boolean;
}

const GistList = ({ gists, token, onUpdate, onDelete, onGistUpdate, autoSave = false }: GistListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGistId, setSelectedGistId] = useState<string | null>(gists[0]?.id || null);

  // Filter gists
  const filteredGists = gists.filter((gist) => {
    const matchesSearch =
      gist.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(gist.files).some((filename) =>
        filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });
  // Flatten all filtered gists for the left panel
  const flatGists = filteredGists;
  // Ensure selectedGistId is always valid (in filtered list)
  useEffect(() => {
    if (flatGists.length === 0) {
      setSelectedGistId(null);
    } else if (!flatGists.some(g => g.id === selectedGistId)) {
      setSelectedGistId(flatGists[0].id);
    }
  }, [searchTerm, filteredGists.length]);

  const selectedGist = flatGists.find(g => g.id === selectedGistId) || flatGists[0];

  // Handler for clearing token
  const handleClearToken = () => {
    removeTokenFromCookie();
    window.location.reload();
  };

  if (gists.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Gists Found</h3>
        <p className="text-slate-600 mb-6">Create your first gist to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[70vh] md:h-[70vh]">
      {/* Left Panel: Gist List */}
      <div className="md:w-1/3 w-full overflow-y-auto border-r border-slate-200 bg-slate-50 rounded-lg p-2">
        {/* Search and Filter Bar */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gists by description or filename..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black font-medium mb-2"
            style={{ color: '#000000' }}
          />
 
        </div>
        {/* Gist Summaries */}
        <div className="space-y-1">
          {flatGists.map(gist => (
            <button
              key={gist.id}
              onClick={() => setSelectedGistId(gist.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium border border-transparent hover:bg-blue-50 ${selectedGistId === gist.id ? 'bg-blue-200 border-blue-400 text-blue-900' : 'bg-white text-slate-900'}`}
            >
              <div className="truncate font-semibold">{gist.description || 'Untitled Gist'}</div>
              <div className="text-xs text-slate-500 truncate">{Object.keys(gist.files).join(', ')}</div>
            </button>
          ))}
        </div>
      </div>
      {/* Right Panel: Selected Gist Content */}
      <div className="flex-1 overflow-y-auto min-h-[400px] md:min-h-[600px]">
        {selectedGist ? (
          <GistItem
            gist={selectedGist}
            token={token}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onGistUpdate={onGistUpdate}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">Select a gist to view details</div>
        )}
      </div>
    </div>
  );
};

export default GistList;
