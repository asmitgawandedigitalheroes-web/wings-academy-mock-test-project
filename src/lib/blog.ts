import 'server-only';
import { createClient } from '@/utils/supabase/server';
import { Blog, BlogInsert, BlogUpdate } from '@/types/blog';

export async function getBlogs(options?: {
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

export async function getBlogBySlug(slug: string) {
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

export async function getBlogById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Blog;
}

export async function upsertBlog(blog: BlogInsert | (BlogUpdate & { id: string })) {
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
  return data as Blog;
}

export async function deleteBlog(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw error;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('category')
    .eq('published', true);

  if (error) throw error;
  
  const categories = Array.from(new Set(data.map(b => b.category).filter(Boolean)));
  return categories as string[];
}

export async function getRelatedBlogs(slug: string, category?: string, limit: number = 3) {
  const supabase = await createClient();
  
  // 1. Try to get blogs in the same category
  let query = supabase
    .from('blogs')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('published', true)
    .neq('slug', slug);

  if (category) {
    query = query.eq('category', category);
  }

  const { data: categoryData, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // 2. If we need more, get most recent ones regardless of category
  if (categoryData.length < limit) {
    const excludeIds = categoryData.map(b => b.id);
    
    let recentQuery = supabase
      .from('blogs')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('published', true)
      .neq('slug', slug);
    
    if (excludeIds.length > 0) {
      recentQuery = recentQuery.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data: recentData } = await recentQuery
      .order('created_at', { ascending: false })
      .limit(limit - categoryData.length);

    return [...categoryData, ...(recentData || [])] as Blog[];
  }

  return categoryData as Blog[];
}
