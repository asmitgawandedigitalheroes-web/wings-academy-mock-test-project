import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Eye, ExternalLink, MoreVertical } from 'lucide-react';
import { getBlogs } from '@/lib/blog';
import { format } from 'date-fns';
import BlogAdminActions from '@/components/admin/blog/BlogAdminActions';

export default async function AdminBlogListPage() {
  const { blogs } = await getBlogs({ onlyPublished: false });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Blog Management</h1>
          <p className="text-slate-500 font-medium mt-1">Create, edit, and publish your aviation insights.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Create New Post
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts by title..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-600 outline-none">
              <option>All Categories</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Title & URL</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Modified</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{blog.title}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">/{blog.slug}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      blog.published 
                        ? 'bg-green-50 text-green-600 border border-green-100' 
                        : 'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-600">{blog.category || '—'}</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">
                    {format(new Date(blog.updated_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                       <Link
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                        title="View Live Post"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/${blog.id}/edit`}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit Post"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete Post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">
                    No blog posts found. Start by creating your first post!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
