import { Gist } from "../types/gist";

const API_BASE = "https://api.github.com";

// Add this header to all fetch/request calls to the GitHub API
const headers = (token: string) => ({
  Authorization: `token ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28", // Adding GitHub API version header
});

export const getGists = async (token: string): Promise<Gist[]> => {
  const response = await fetch(`${API_BASE}/gists`, {
    headers: headers(token),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gists: ${response.statusText}`);
  }

  return response.json();
};

export const getGistDetails = async (token: string, gistId: string): Promise<Gist> => {
  const response = await fetch(`${API_BASE}/gists/${gistId}`, {
    headers: headers(token),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gist details: ${response.statusText}`);
  }

  return response.json();
};

export const createGist = async (
  token: string,
  gistData: {
    description: string;
    public: boolean;
    files: { [key: string]: { content: string } };
  }
): Promise<Gist> => {
  const response = await fetch(`${API_BASE}/gists`, {
    method: "POST",
    headers: {
      ...headers(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gistData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create gist: ${response.statusText}`);
  }

  return response.json();
};

export const updateGist = async (
  token: string,
  gistId: string,
  gistData: {
    description?: string;
    files?: { [key: string]: { content: string } };
  }
): Promise<Gist> => {
  const response = await fetch(`${API_BASE}/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      ...headers(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gistData),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Forbidden: Your token may not have 'gist' scope permissions");
    }
    if (response.status === 404) {
      throw new Error("Gist not found or you don't have permission to edit it");
    }
    throw new Error(`Failed to update gist: ${response.statusText}`);
  }

  return response.json();
};

export const deleteGist = async (token: string, gistId: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/gists/${gistId}`, {
    method: "DELETE",
    headers: headers(token),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete gist: ${response.statusText}`);
  }
};
