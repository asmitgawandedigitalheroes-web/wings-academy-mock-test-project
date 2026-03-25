'use client';

import { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Find all headings in the blog content
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    const seenIds = new Set<string>();
    const tocItems = headings.map((heading: Element, index: number) => {
      let id = heading.id || heading.textContent?.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-') || `heading-${index}`;
      
      // Handle duplicates
      let originalId = id;
      let counter = 1;
      while (seenIds.has(id)) {
        id = `${originalId}-${counter}`;
        counter++;
      }
      seenIds.add(id);
      heading.id = id;

      return {
        id: id,
        text: heading.textContent || `Section ${index + 1}`,
        level: parseInt(heading.tagName.charAt(1)),
      };
    });
    setItems(tocItems);

    // Intersection Observer to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav className="hidden lg:block">
      <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Table of Contents</h4>
      <ul className="space-y-3">
        {items.map((item) => (
          <li 
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 1}rem` }}
          >
            <a
              href={`#${item.id}`}
              className={`block text-sm transition-colors hover:text-primary ${
                activeId === item.id ? 'font-semibold text-primary' : 'text-gray-600'
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
