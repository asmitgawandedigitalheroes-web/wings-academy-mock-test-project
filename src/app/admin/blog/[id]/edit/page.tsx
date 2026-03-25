import { notFound } from 'next/navigation';
import AdminEditor from '@/components/admin/blog/AdminEditor';
import { getBlogById } from '@/lib/blog';

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const blog = await getBlogById(id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminEditor initialData={blog} />
    </div>
  );
}
