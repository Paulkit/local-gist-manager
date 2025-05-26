"use client";

// This script adds inline styles to form controls to ensure they always have visible text

if (typeof window !== 'undefined') {
  // Wait for DOM to be loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Force black text on all form elements
    const styleFormElements = () => {
      const formElements = document.querySelectorAll('input, select, textarea, [class*="text-slate-"]');
      
      formElements.forEach(el => {
        // Apply visible text styles
        el.style.color = '#000000';
        
        // For inputs, textareas, and selects, apply a white background
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
          el.style.backgroundColor = '#ffffff';
          el.style.fontWeight = '600';
        }
        
        // For select options
        if (el.tagName === 'SELECT') {
          const options = el.querySelectorAll('option');
          options.forEach(opt => {
            opt.style.color = '#000000';
            opt.style.backgroundColor = '#ffffff';
          });
        }
      });
    };
    
    // Apply styles on load
    styleFormElements();
    
    // Apply again after any potential React renders
    setTimeout(styleFormElements, 1000);
    
    // Set up a mutation observer to catch dynamically added elements
    const observer = new MutationObserver(styleFormElements);
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

export {}; // This file is a module
