'use server';

import { createClient } from '@/utils/supabase/server';
import { Blog, BlogInsert, BlogUpdate } from '@/types/blog';
import { revalidatePath } from 'next/cache';

export async function getBlogsAction(options?: {
  limit?: number;
  offset?: number;
  category?: string;
  onlyPublished?: boolean;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('blogs')
    .select(`
      *,
      author:profiles(*)
    `)
    .order('created_at', { ascending: false });

  if (options?.onlyPublished !== false) {
    query = query.eq('published', true);
  }

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.limit) {
    const from = options.offset || 0;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { blogs: data as Blog[], count };
}

export async function getBlogBySlugAction(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Blog;
}

export async function upsertBlogAction(blog: BlogInsert | (BlogUpdate & { id: string })) {
  const supabase = await createClient();
  
  // Get current user for author_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Generate slug if not provided and it's an insert
  if (!('id' in blog) && !blog.slug) {
    blog.slug = blog.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  const payload = {
    ...blog,
    author_id: user.id, // Ensure author_id is set to current admin
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('blogs')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/blog');
  revalidatePath(`/blog/${blog.slug}`);
  revalidatePath('/admin/blog');
  
  return data as Blog;
}

export async function deleteBlogAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw error;
  
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
}

export async function getCategoriesAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('blogs')
    .select('category')
    .eq('published', true);

  if (error) throw error;
  
  const categories = Array.from(new Set(data.map(b => b.category).filter(Boolean)));
  return categories as string[];
}

export async function uploadBlogImageAction(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath);

  return publicUrl;
}
