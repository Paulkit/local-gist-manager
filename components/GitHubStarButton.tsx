"use client";
import { useEffect, useRef, useState } from "react";

export default function GitHubStarButton() {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Dynamically load the GitHub Buttons script only on the client
    if (!document.getElementById("github-bjs")) {
      const script = document.createElement("script");
      script.id = "github-bjs";
      script.async = true;
      script.defer = true;
      script.src = "https://buttons.github.io/buttons.js";
      document.body.appendChild(script);
    } else if (window && (window as any).GitHubButton) {
      (window as any).GitHubButton.render(ref.current, function() {});
    }
  }, []);

  if (!mounted) return null;

  return (
    <div ref={ref}>
      <a
        className="github-button"
        href="https://github.com/Paulkit/local-gist-manager"
        data-color-scheme="no-preference: light; light: light; dark: dark;"
        data-size="large"
        data-show-count="true"
        aria-label="Star buttons/github-buttons on GitHub"
      >
        Star
      </a>
    </div>
  );
}
