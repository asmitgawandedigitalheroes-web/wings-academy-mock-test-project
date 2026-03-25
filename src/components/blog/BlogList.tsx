import { Blog } from '@/types/blog';
import { BlogCard } from './BlogCard';

interface BlogListProps {
  blogs: Blog[];
}

export function BlogList({ blogs }: BlogListProps) {
  if (!blogs.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 text-center">
        <h3 className="text-xl font-black text-slate-900">No blog posts found</h3>
        <p className="mt-2 text-sm font-medium text-slate-500 max-w-xs mx-auto">Check back later for new aviation insights and exam preparation tips.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
