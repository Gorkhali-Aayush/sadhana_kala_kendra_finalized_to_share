'use client';

import React from 'react';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

export default function SafeHTML({ html, className = '' }: SafeHTMLProps) {
  if (!html) {
    return <div className={className}>No content available</div>;
  }

  // Basic whitelist of safe tags commonly used by Quill
  const sanitizeHTML = (dirtyHTML: string): string => {
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                        'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 
                        'span', 'div', 'iframe'];
    const allowedAttrs = ['href', 'title', 'src', 'alt', 'width', 'height', 'class', 'style'];

    // Create a temporary container
    const temp = document.createElement('div');
    temp.innerHTML = dirtyHTML;

    // Remove script tags and other unsafe elements
    const scripts = temp.querySelectorAll('script, style, object, embed');
    scripts.forEach(script => script.remove());

    // Clean all elements
    const clean = (element: Element) => {
      for (let i = element.children.length - 1; i >= 0; i--) {
        const child = element.children[i];
        const tagName = child.tagName.toLowerCase();

        // Remove disallowed tags but keep their content
        if (!allowedTags.includes(tagName)) {
          while (child.firstChild) {
            element.insertBefore(child.firstChild, child);
          }
          element.removeChild(child);
          continue;
        }

        // Remove disallowed attributes
        Array.from(child.attributes).forEach(attr => {
          // Allow data attributes for styling
          if (!allowedAttrs.includes(attr.name) && !attr.name.startsWith('data-')) {
            child.removeAttribute(attr.name);
          }
        });

        clean(child);
      }
    };

    clean(temp);
    return temp.innerHTML;
  };

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      // Use dangerouslySetInnerHTML only after sanitizing
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }}
      style={{
        fontSize: '1rem',
        lineHeight: '1.6',
        color: '#374151',
      }}
    />
  );
}
