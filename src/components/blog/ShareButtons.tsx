'use client';

import { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Link, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Base URL for the site
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = mounted ? `${baseUrl}/blog/${slug}` : '';

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  if (!mounted) return <div className="h-24" />; // Avoid hydration flicker

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Share Article</h4>
      <div className="flex flex-wrap gap-3">
        {/* Copy Link Button */}
        <button
          onClick={copyToClipboard}
          className={`flex h-11 items-center justify-center gap-2 rounded-xl transition-all shadow-sm ${copied
            ? 'px-4 bg-primary text-white min-w-[100px]'
            : 'w-11 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          title="Copy Link"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span className="text-xs font-bold whitespace-nowrap">Copied!</span>
            </>
          ) : (
            <Link className="h-5 w-5" />
          )}
        </button>

        <div className="flex gap-2">
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-[#1877F2] hover:text-white hover:scale-105 shadow-sm"
            title="Share on Facebook"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-[#1DA1F2] hover:text-white hover:scale-105 shadow-sm"
            title="Share on Twitter"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-[#0A66C2] hover:text-white hover:scale-105 shadow-sm"
            title="Share on LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
