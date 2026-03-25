import React from 'react';

interface BlogContentRendererProps {
  content: string;
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  return (
    <div 
      className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:opacity-80 prose-img:rounded-3xl prose-blockquote:border-primary/20 prose-blockquote:bg-slate-50/50 prose-blockquote:py-1 [&_h1]:text-4xl [&_h1]:text-primary [&_h1]:font-black [&_h1]:mt-12 [&_h1]:mb-6 [&_h2]:text-3xl [&_h2]:text-primary [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-2xl [&_h3]:text-primary [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_h4]:text-xl [&_h4]:text-primary [&_h4]:font-bold [&_h4]:mt-6 [&_h4]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:space-y-2"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
