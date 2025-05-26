"use client";
export const runtime = 'edge';

import { useState, useEffect } from "react";
import TokenForm from "../components/TokenForm";
import GistList from "../components/GistList";
import CreateGistForm from "../components/CreateGistForm";
import GitHubStarButton from "../components/GitHubStarButton";
import { getGists, deleteGist, updateGist, createGist, getGistDetails } from "../utils/api";
import { Gist } from "../types/gist";
import { saveTokenToCookie, getTokenFromCookie, removeTokenFromCookie } from '../utils/cookie-utils';
import { unstable_noStore as noStore } from 'next/cache';
import { PublicEnvScript, env } from 'next-runtime-env';

// Refactored Home component
export default function Home() {
  const [token, setToken] = useState("");
  const [gists, setGists] = useState<Gist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [initializing, setInitializing] = useState(true); // Indicate app is initializing
  const [tokenLoaded, setTokenLoaded] = useState(false); // Track whether token has been loaded
  const [stars, setStars] = useState<number | null>(null); // Track GitHub repository stars
  // Add a flag to track if token was ever checked and failed
  const [tokenInvalid, setTokenInvalid] = useState(false);

  // Load token from env, cookies, or prompt on component mount
  useEffect(() => {
    const loadSavedToken = async () => {
      try {
        if (typeof window === 'undefined') return;
        // 1. Check for token in cookie first
        const savedToken = getTokenFromCookie();
        setTokenLoaded(true);
        if (savedToken) {
          setToken(savedToken);
          setLoading(true);
          try {
            const fetchedGists = await getGists(savedToken);
            setGists(fetchedGists);
            setTokenInvalid(false);
          } catch (err) {
            setError("Failed to fetch gists. Please check your token.");
            setGists([]);
            removeTokenFromCookie();
            setToken("");
            setTokenInvalid(true);
          } finally {
            setLoading(false);
          }
          return; // If cookie token exists, do not use env token
        }
        // 2. If no cookie token, try to get token from next-runtime-env (env function)
        const envToken = env('NEXT_PUBLIC_GITHUB_TOKEN') || '';
        if (envToken) {
          setToken(envToken);
          setLoading(true);
          try {
            const fetchedGists = await getGists(envToken);
            setGists(fetchedGists);
            saveTokenToCookie(envToken); // Save to cookie for client-side
            setTokenLoaded(true);
            setInitializing(false);
            setTokenInvalid(false);
            return;
          } catch (err) {
            setToken("");
            setGists([]);
            removeTokenFromCookie();
            setTokenInvalid(true);
          } finally {
            setLoading(false);
          }
        }
      } catch (err) {
        setInitializing(false);
      } finally {
        setInitializing(false);
      }
    };
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        loadSavedToken();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setInitializing(false);
    }
  }, []);

  const handleTokenSubmit = async (submittedToken: string) => {
    setToken(submittedToken);
    setLoading(true);
    setError("");
    setTokenInvalid(false);
    try {
      const fetchedGists = await getGists(submittedToken);
      setGists(fetchedGists);
      // Save token to cookies when successful
      saveTokenToCookie(submittedToken);
      setTokenInvalid(false);
    } catch (err) {
      setError("Failed to fetch gists. Please check your token.");
      setGists([]);
      // Clear token from cookies if it's invalid
      removeTokenFromCookie();
      setTokenInvalid(true);
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGist = async (gistId: string, description: string) => {
    if (!token) return;

    try {
      console.log("Updating gist:", gistId, "with description:", description);
      const updatedGist = await updateGist(token, gistId, { description });
      console.log("Update successful:", updatedGist);
      setGists((prev) =>
        prev.map((gist) =>
          gist.id === gistId ? { ...gist, description } : gist
        )
      );
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update gist. Please check your token permissions.");
    }
  };

  const handleGistUpdate = (updatedGist: Gist) => {
    setGists((prev) =>
      prev.map((gist) => (gist.id === updatedGist.id ? updatedGist : gist))
    );
  };

  const handleDeleteGist = async (gistId: string) => {
    if (!token) return;

    try {
      await deleteGist(token, gistId);
      setGists((prev) => prev.filter((gist) => gist.id !== gistId));
    } catch (err) {
      setError("Failed to delete gist.");
    }
  };

  const handleCreateGist = async (gistData: {
    description: string;
    public: boolean;
    files: { [key: string]: { content: string } };
  }) => {
    if (!token) return;

    try {
      const newGist = await createGist(token, gistData);
      setGists((prev) => [newGist, ...prev]);
      setShowCreateForm(false);
    } catch (err) {
      setError("Failed to create gist.");
    }
  };

  const handleLogout = () => {
    setToken("");
    setGists([]);
    setError("");
    setShowCreateForm(false);
    // Remove token from cookies on logout
    removeTokenFromCookie();
  };

  return (
    <>
      <PublicEnvScript />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="h-8 w-8 mr-3 flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                </div>
                <span className="font-semibold text-xl   bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                 Local Gist Manager
                </span>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => window.location.hash = 'tutorial'}
                  className="text-slate-600 hover:text-white  hover:bg-blue-200 transition-colors text-sm font-medium border border-slate-300 px-4 py-2 rounded-lg bg-white flex items-center gap-2 cursor-pointer"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4h9" />
                    <rect width="16" height="12" x="4" y="6" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  Codebase Tutorial
                </button>
                {token && (
                  <button
                    onClick={handleLogout}
                    className="bg-red-600   hover:bg-red-800 text-white border border-red-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Token
                  </button>
                )}
                <GitHubStarButton />
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {initializing ? (
            // Show loading spinner during initialization
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading your gists...</p>
            </div>
          ) : !tokenLoaded ? (
            // Show loading if cookies haven't been checked yet
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Checking for saved session...</p>
            </div>
          ) : !token || tokenInvalid ? (
            // Landing Page (force re-enter if token invalid)
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <a
                  href="https://docs.github.com/en/rest/gists?apiVersion=2022-11-28"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-black  text-sm font-medium mb-6 hover:shadow-sm hover:bg-blue-200"
                >
                  😀
                  Powered by GitHub API
                </a>
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                  Manage Your
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {" "}GitHub Gists
                  </span>
                  <br />Like a Pro
                </h1>
                <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Professional gist management with syntax highlighting, tagging, and quick actions.
                  <br />Your complete toolkit for organizing code snippets effortlessly.
                </p>
                
                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-3 mb-16">
                  <div className="flex items-center text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    CRUD Operations
                  </div>
                  <div className="flex items-center text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Syntax Highlighting
                  </div>
                  <div className="flex items-center text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Search & Filter
                  </div>
                  <div className="flex items-center text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Quick Actions
                  </div>
                </div>
              </div>




              <div className="max-w-lg mx-auto">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Get Started</h3>
                    <p className="text-slate-600">
                      Enter your GitHub Personal Access Token to continue
                    </p>
                  </div>
                  <TokenForm onTokenSubmit={handleTokenSubmit} />
                  {loading && (
                    <div className="mt-4 flex items-center justify-center text-blue-600">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading your gists...
                    </div>
                  )}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              
            </div>
          ) : (gists.length > 0 || loading) ? (
            // Dashboard (only if token is valid and gists loaded or loading)
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {showCreateForm ? (
                <div className="max-w-4xl mx-auto">
                  <CreateGistForm
                    onCreateGist={handleCreateGist}
                    onCancel={() => setShowCreateForm(false)}
                  />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Dashboard Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Gists</h2>
                      <p className="text-slate-600">
                        Manage and organize your code snippets
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New Gist
                      </button>
              
                    </div>
                  </div>
                  
                  {/* Error Display */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                      {error}
                    </div>
                  )}
                  
                  {/* Gist List */}
                  <GistList
                    gists={gists}
                    token={token}
                    onUpdate={handleUpdateGist}
                    onDelete={handleDeleteGist}
                    onGistUpdate={handleGistUpdate}
                 
                  />
                </div>
              )}
            </div>
          ) : (
            // If token is valid but no gists, show a friendly message
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-2xl text-slate-500 mb-4">No Gists Found</div>
              <button
                onClick={handleLogout}
                className="mt-2 bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Clear Token & Try Again
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-600">
              Built with{" "}
              <span className="text-red-500">♥</span> using Next.js & Tailwind CSS
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
