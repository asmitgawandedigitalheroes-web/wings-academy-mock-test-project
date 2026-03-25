'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, X, Eye, Image as ImageIcon, Settings, FileText, Upload, Loader2,
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Link, Quote, Type
} from 'lucide-react';
import { Blog, BlogInsert, BlogUpdate } from '@/types/blog';
import { upsertBlogAction, uploadBlogImageAction } from '@/app/actions/blog';

interface AdminEditorProps {
  initialData?: Blog;
}

export default function AdminEditor({ initialData }: AdminEditorProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
  const [isMetaTitleTouched, setIsMetaTitleTouched] = useState(!!initialData?.meta_title);
  const [isMetaDescTouched, setIsMetaDescTouched] = useState(!!initialData?.meta_description);
  
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    featured_image: initialData?.featured_image || '',
    category: initialData?.category || '',
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    published: initialData?.published || false,
    tags: initialData?.tags || [],
  });

  // Sync editor content with formData.content on mount
  useEffect(() => {
    if (editorRef.current && initialData?.content) {
      editorRef.current.innerHTML = initialData.content;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    updateFormData(name, val);
  };

  const updateFormData = (name: string, val: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: val };

      if (name === 'title') {
        if (!prev.slug && !initialData) {
          newData.slug = val.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
        }
        if (!isMetaTitleTouched) newData.meta_title = val;
      }

      if ((name === 'excerpt' || name === 'content') && !isMetaDescTouched) {
        const sourceText = name === 'excerpt' ? val : (newData.excerpt || (name === 'content' ? val : prev.content));
        const plainText = (sourceText || '').replace(/<[^>]*>/g, '').substring(0, 160);
        newData.meta_description = plainText;
      }

      if (name === 'meta_title') setIsMetaTitleTouched(true);
      if (name === 'meta_description') setIsMetaDescTouched(true);

      return newData;
    });
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      updateFormData('content', editorRef.current.innerHTML);
    }
  };

  const handleCommand = (e: React.MouseEvent, command: string, value: string | undefined = undefined) => {
    e.preventDefault();
    
    // Ensure the editor is focused before executing command
    editorRef.current?.focus();

    // Some browsers prefer <h2> over h2 for formatBlock
    let finalValue = value;
    if (command === 'formatBlock' && value && !value.startsWith('<')) {
      finalValue = `<${value}>`;
    }

    try {
      document.execCommand(command, false, finalValue);
    } catch (err) {
      console.error('Command failed:', command, err);
    }

    handleEditorInput();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    
    e.preventDefault();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    // If we have HTML (standard mouse copy), preserve it
    if (html) {
      try {
        const fragment = range.createContextualFragment(html);
        range.insertNode(fragment);
      } catch (err) {
        document.execCommand('insertHTML', false, html);
      }
    } else if (text) {
      // SMART PASTE: Check if it's Markdown (common when clicking ChatGPT's "Copy" button)
      let processed = text;
      if (text.includes('## ') || text.includes('**')) {
        // Simple Markdown patterns to HTML
        processed = text
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
          .split('\n').map(l => l.trim().startsWith('<') ? l : `<p>${l}</p>`).join('');
        
        try {
          const fragment = range.createContextualFragment(processed);
          range.insertNode(fragment);
        } catch (err) {
          document.execCommand('insertHTML', false, processed);
        }
      } else {
        // Just plain text
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
      }
    }
    
    // Move cursor to end
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    handleEditorInput();
  };



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = await uploadBlogImageAction(formData);
      setFormData((prev) => ({ ...prev, featured_image: url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        id: initialData?.id,
      } as any;

      await upsertBlogAction(payload);
      router.push('/admin/blog');
      router.refresh();
    } catch (error) {
      console.error('Failed to save blog:', error);
      alert('Error saving blog. Please check the console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4 sticky top-0 z-20 bg-gray-50/80 backdrop-blur-sm py-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {initialData ? 'Edit Blog Post' : 'Create New Blog'}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            {initialData ? `Editing: ${initialData.title}` : 'Draft your next aviation insight'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Post Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a catchy title..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'content' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <FileText className="h-4 w-4" />
                Content Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Settings className="h-4 w-4" />
                SEO & Settings
              </button>
            </div>

            {activeTab === 'content' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                 <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Excerpt / Summary</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Short description for the listing page..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Body Content</label>
                    <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-widest">WYSIWYG Editor</div>
                  </div>
                  
                  {/* Custom Rich Text Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-t-xl border-b-0">
                    <button type="button" onMouseDown={(e) => handleCommand(e, 'bold')} className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all" title="Bold">
                      <Bold className="h-4 w-4" />
                    </button>
                    <button type="button" onMouseDown={(e) => handleCommand(e, 'italic')} className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all" title="Italic">
                      <Italic className="h-4 w-4" />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                    <button type="button" onMouseDown={(e) => handleCommand(e, 'formatBlock', 'h2')} className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all" title="Heading 2">
                      <Heading2 className="h-4 w-4" />
                    </button>
                    <button type="button" onMouseDown={(e) => handleCommand(e, 'formatBlock', 'h3')} className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all" title="Heading 3">
                      <Heading3 className="h-4 w-4" />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                    <button type="button" onMouseDown={(e) => handleCommand(e, 'insertUnorderedList')} className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all" title="Bullet List">
                      <List className="h-4 w-4" />
                    </button>
                    <button type="button" onMouseDown={(e) => handleCommand(e, 'insertOrderedList')} className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all" title="Numbered List">
                      <ListOrdered className="h-4 w-4" />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                    <button type="button" onMouseDown={(e) => handleCommand(e, 'formatBlock', 'blockquote')} className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all" title="Quote">
                      <Quote className="h-4 w-4" />
                    </button>
                    <button type="button" onMouseDown={(e) => {
                      e.preventDefault();
                      const url = prompt('Enter the URL:');
                      if (url) handleCommand(e, 'createLink', url);
                    }} className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all" title="Insert Link">
                      <Link className="h-4 w-4" />
                    </button>
                  </div>

                  {/* ContentEditable Area */}
                  <div
                    ref={editorRef}
                    contentEditable={true}
                    onInput={handleEditorInput}
                    onBlur={handleEditorInput}
                    onPaste={handlePaste}
                    className="w-full min-h-[400px] max-h-[600px] overflow-y-auto rounded-b-xl border border-slate-200 px-6 py-6 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-white prose prose-slate prose-lg max-w-none shadow-inner [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic"
                  />
                  <input type="hidden" name="content" value={formData.content} required />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Slug URL</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category || ''}
                      onChange={handleChange}
                      placeholder="e.g., Exam Tips"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Meta Title</label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title || ''}
                    onChange={handleChange}
                    placeholder="SEO Title (defaults to post title)"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Meta Description</label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="SEO Description for search engines..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">Publishing</h3>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <div className="text-sm font-black text-slate-900">Post Status</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  {formData.published ? 'Publicly Visible' : 'Private Draft'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Featured Image
              </label>
              
              <div className={`relative group aspect-video rounded-2xl overflow-hidden border-2 border-dashed transition-all ${
                formData.featured_image ? 'border-transparent' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary/50'
              }`}>
                {formData.featured_image ? (
                  <>
                    <img src={formData.featured_image} alt="Preview" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all">
                        Change Image
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-6 text-center">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                    ) : (
                      <Upload className="h-8 w-8 text-slate-300 mb-2 group-hover:text-primary group-hover:scale-110 transition-all" />
                    )}
                    <span className="text-xs font-bold text-slate-500">
                      {uploading ? 'Uploading...' : 'Click or drag to upload featured image'}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or provide an external URL</label>
                <input
                  type="text"
                  name="featured_image"
                  value={formData.featured_image || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Quick Tips</h3>
            <ul className="space-y-3 text-xs font-bold text-slate-500 list-disc pl-4 leading-relaxed">
              <li>Use <strong>H2</strong> and <strong>H3</strong> tags for sections to auto-generate the Table of Contents.</li>
              <li>Always include a featured image for better engagement.</li>
              <li>Slugs are auto-generated but can be manually adjusted in settings.</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
