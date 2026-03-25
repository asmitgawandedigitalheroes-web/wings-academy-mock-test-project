export interface Profile {
  id: string;
  full_name: string | null;
  role: 'student' | 'admin';
  email: string | null;
  avatar_url: string | null;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_id: string;
  meta_title: string | null;
  meta_description: string | null;
  published: boolean;
  category: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export type BlogInsert = Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'author'>;
export type BlogUpdate = Partial<BlogInsert>;
