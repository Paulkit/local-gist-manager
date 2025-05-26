"use client";

import { useState, useEffect } from "react";
import { getTokenFromCookie, hasTokenInCookie } from '../utils/cookie-utils';
import { Key, Check, Clock, Github, ExternalLink } from 'lucide-react';

interface TokenFormProps {
  onTokenSubmit: (token: string) => void;
}

const TokenForm = ({ onTokenSubmit }: TokenFormProps) => {
  const [token, setToken] = useState("");
  const [hasSavedToken, setHasSavedToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
    
  // Check for saved token in cookies on component mount
  useEffect(() => {
    // Small delay to ensure client-side rendering is complete
    const timer = setTimeout(() => {
      const savedToken = getTokenFromCookie();
      
      if (savedToken) {
        setToken(savedToken);
        setHasSavedToken(true);
      }
      
      setIsCheckingToken(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="relative">          {isCheckingToken ? (
            <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center">
              <Clock className="animate-spin h-5 w-5 mr-2 text-blue-600" />
              <span className="text-slate-600">Loading saved token...</span>
            </div>
          ) : (
            <>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key size={16} className="text-slate-400" />
              </div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full pl-10 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                required
              />
              {hasSavedToken && (
                <span className="absolute right-3 top-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Saved
                </span>
              )}
            </>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Need a token?{" "}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create one here
          </a>
        </p>
        {hasSavedToken && (
          <p className="mt-2 text-sm text-green-600">
            <span className="font-medium">✓</span> Your token has been saved and will be remembered between sessions
          </p>
        )}
      </div>      <button
        type="submit"
        disabled={isCheckingToken}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
      >
        {isCheckingToken 
          ? 'Checking for saved token...' 
          : hasSavedToken 
            ? 'Reconnect to GitHub' 
            : 'Connect to GitHub'
        }
      </button>
    </form>
  );
};

export default TokenForm;
