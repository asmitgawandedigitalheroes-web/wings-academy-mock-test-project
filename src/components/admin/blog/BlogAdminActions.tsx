'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { deleteBlogAction } from '@/app/actions/blog';
import ConfirmationModal from '@/components/common/ConfirmationModal';

interface BlogAdminActionsProps {
  blogId: string;
  blogSlug: string;
}

export default function BlogAdminActions({ blogId, blogSlug }: BlogAdminActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBlogAction(blogId);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete blog:', error);
      alert('Error deleting blog.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/blog/${blogSlug}`}
          target="_blank"
          className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
          title="View Live Post"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
        <Link
          href={`/admin/blog/${blogId}/edit`}
          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          title="Edit Post"
        >
          <Edit2 className="h-4 w-4" />
        </Link>
        <button
          onClick={() => setShowModal(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
          title="Delete Post"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <ConfirmationModal
        isOpen={showModal}
        title="Delete Blog Post?"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        type="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
