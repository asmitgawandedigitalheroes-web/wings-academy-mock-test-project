import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BlogContentRenderer } from '@/components/blog/BlogContentRenderer';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { getBlogBySlug, getRelatedBlogs } from '@/lib/blog';
import { format } from 'date-fns';
import { Calendar, User, Clock, Share2, ArrowRight, ArrowLeft } from 'lucide-react';
import ShareButtons from '@/components/blog/ShareButtons';
import { BlogCard } from '@/components/blog/BlogCard';
import Link from 'next/link';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found | Wings Academy',
    };
  }

  return {
    title: blog.meta_title || `${blog.title} | Wings Academy`,
    description: blog.meta_description || blog.excerpt || `Read ${blog.title} on Wings Academy Blog.`,
    openGraph: {
      title: blog.title,
      description: blog.excerpt || blog.meta_description || '',
      images: blog.featured_image ? [{ url: blog.featured_image }] : [],
      type: 'article',
      publishedTime: blog.created_at,
      authors: [blog.author?.full_name || 'Wings Academy'],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = await getRelatedBlogs(slug, blog.category || undefined);

  const formattedDate = format(new Date(blog.created_at), 'MMMM dd, yyyy');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-32 pb-20">
        <article className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Back Button */}
            <Link 
              href="/blog" 
              className="group mb-12 inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 transition-all hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>

            {/* Breadcrumbs & Category */}
            <div className="mb-8 flex items-center gap-2">
              <span className="rounded-xl bg-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">
                {blog.category || 'General'}
              </span>
            </div>

            {/* Title Section */}
            <h1 className="mb-8 text-4xl font-black text-primary md:text-6xl md:leading-[1.1] tracking-tight">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="mb-10 flex flex-wrap items-center gap-6 border-y border-gray-100 py-6 text-gray-500">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                  {blog.author?.avatar_url ? (
                    <Image src={blog.author.avatar_url} alt={blog.author.full_name || ''} width={40} height={40} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold">
                      {blog.author?.full_name?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{blog.author?.full_name || 'Wings Academy Admin'}</div>
                  <div className="text-xs">Author</div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{formattedDate}</span>
              </div>

              <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                <Clock className="h-4 w-4" />
                <span className="text-sm">5 min read</span>
              </div>
            </div>

            {/* Featured Image */}
            {blog.featured_image && (
              <div className="relative mb-16 aspect-[21/9] w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-slate-100">
                <Image
                  src={blog.featured_image}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Article Content Layout */}
            <div className="relative flex flex-col gap-12 lg:flex-row">
              {/* Sidebar TOC */}
              <aside className="lg:sticky lg:top-32 lg:h-fit lg:w-64">
                <TableOfContents />

                {/* Social Share */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <ShareButtons title={blog.title} slug={blog.slug} />
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1">
                <BlogContentRenderer content={blog.content} />

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-12 flex flex-wrap gap-2 border-t border-gray-100 pt-8">
                    {blog.tags.map((tag) => (
                      <span key={tag} className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts Section */}
        {relatedBlogs.length > 0 && (
          <section className="mt-24 border-t border-slate-100 bg-slate-50/30 py-24">
            <div className="container mx-auto px-4">
              <div className="mb-16 flex items-end justify-between">
                <div>
                  <h2 className="mb-4 text-4xl font-black text-slate-900 tracking-tight">Related Articles</h2>
                  <p className="text-slate-500 font-bold text-lg">More insights to fuel your aviation career</p>
                </div>
                <Link
                  href="/blog"
                  className="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all underline-offset-4 hover:underline"
                >
                  View All Posts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {relatedBlogs.map((relatedBlog) => (
                  <BlogCard key={relatedBlog.id} blog={relatedBlog} />
                ))}
              </div>

              <div className="mt-12 text-center md:hidden">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary"
                >
                  View All Posts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
