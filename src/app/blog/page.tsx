import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BlogList } from '@/components/blog/BlogList';
import { getBlogs, getCategories } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog | Wings Academy',
  description: 'Stay updated with the latest news, tips, and insights on AME exams, aviation engineering, and certification from Wings Academy.',
};

export default async function BlogPage() {
  const { blogs } = await getBlogs();
  const categories = await getCategories();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-black text-slate-900 md:text-6xl tracking-tight">
              Wings Academy <span className="text-primary underline decoration-primary/20 underline-offset-8">Blog</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Your ultimate resource for AME exam preparation, industry insights, and career guidance in aviation.
            </p>
          </div>

          {/* Categories (Optional/Bonus) */}
          {categories.length > 0 && (
            <div className="mb-12 flex flex-wrap justify-center gap-3">
              <button className="rounded-xl bg-primary px-8 py-3 text-sm font-black text-white shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95">
                All Posts
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className="rounded-xl bg-white px-8 py-3 text-sm font-bold text-slate-600 border border-slate-100 transition-all hover:bg-slate-50 hover:border-slate-200"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Blog Grid */}
          <BlogList blogs={blogs} />
        </div>
      </main>
      <Footer />
    </>
  );
}
