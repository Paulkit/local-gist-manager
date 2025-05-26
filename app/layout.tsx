"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./form-styles.js";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* GitHub Buttons script for star button */}
        <script async defer src="https://buttons.github.io/buttons.js"></script>
        <title>Local Gist Manager | Organize Your Code Snippets</title>
        <meta name="description" content="Manage your GitHub Gists with tags, syntax highlighting, and quick actions." />
        <meta name="theme-color" content="#1E5AFB" /> 
        <meta name="theme-color" content="#1E5AFB" media="(prefers-color-scheme: light)"/>
        <meta name="theme-color" content="#1E5AFB" media="(prefers-color-scheme: dark)"/>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
