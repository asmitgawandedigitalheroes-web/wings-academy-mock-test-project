import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Blog } from '@/types/blog';
import { format } from 'date-fns';

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  const formattedDate = format(new Date(blog.created_at), 'MMMM dd, yyyy');

  return (
    <div className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
      {/* Featured Image */}
      <Link href={`/blog/${blog.slug}`} className="relative h-64 w-full overflow-hidden">
        {blog.featured_image ? (
          <Image
            src={blog.featured_image}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50 text-primary">
            No Image
          </div>
        )}
        {blog.category && (
          <div className="absolute top-6 left-6 rounded-xl bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 backdrop-blur-sm group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-accent/20 transition-all duration-500">
            {blog.category}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-8">
        <div className="mb-4 flex items-center gap-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-1.5 transition-colors group-hover:text-primary/60">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-200" />
          <div className="flex items-center gap-1.5 transition-colors group-hover:text-primary/60">
            <User className="h-3.5 w-3.5" />
            {blog.author?.full_name || 'Admin'}
          </div>
        </div>

        <Link href={`/blog/${blog.slug}`}>
          <h3 className="mb-4 text-2xl font-black leading-tight text-slate-900 transition-colors group-hover:text-primary">
            {blog.title}
          </h3>
        </Link>

        <p className="mb-8 line-clamp-2 text-sm leading-relaxed font-medium text-slate-500">
          {blog.excerpt || 'Read the full story to learn more about this topic...'}
        </p>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between overflow-hidden">
          <Link
            href={`/blog/${blog.slug}`}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary transition-all group-hover:gap-3"
          >
            Read Article
            <ArrowRight className="h-4 w-4 transition-transform" />
          </Link>
          <div className="h-1 w-0 bg-accent transition-all duration-500 group-hover:w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
