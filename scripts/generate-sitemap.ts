/**
 * Sitemap Generator Script
 * Run this to automatically generate sitemap.xml with dynamic content
 * 
 * Usage: npm run generate:sitemap
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = "https://ozwuaxzpwfsrgvvvddku.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96d3VheHpwd2Zzcmd2dnZkZGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjcyMTIsImV4cCI6MjA3MjA0MzIxMn0.p4gbpSOvIJLTMxF3iLdAjvE4y9YTNEf_o20Fz7OzgoM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const SITE_URL = 'https://ibbe.in';

// Static routes configuration
const STATIC_ROUTES = [
  {
    url: '/',
    changefreq: 'weekly',
    priority: 1.0
  },
  {
    url: '/blog',
    changefreq: 'daily',
    priority: 0.9
  },
  {
    url: '/news',
    changefreq: 'daily',
    priority: 0.9
  }
];

// Navigation sections (anchor links)
const NAVIGATION_SECTIONS = [
  'products',
  'funding',
  'about',
  'guides',
  'waitlist'
];

async function generateSitemap() {
  console.log('🔄 Starting sitemap generation...');
  const today = new Date().toISOString().split('T')[0];

  try {
    // Fetch Blog Posts
    console.log('📥 Fetching blog posts...');
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('is_published', true);

    if (blogError) throw blogError;

    // Fetch News Posts
    console.log('📥 Fetching news posts...');
    const { data: newsPosts, error: newsError } = await supabase
      .from('news_posts')
      .select('id, updated_at, published_at')
      .eq('is_published', true);

    if (newsError) throw newsError;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Static Pages -->`;

    // Add Static Routes
    STATIC_ROUTES.forEach(route => {
      xml += `
  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    });

    xml += `\n\n  <!-- Navigation Sections -->`;

    // Add Navigation Sections
    NAVIGATION_SECTIONS.forEach(section => {
      xml += `
  <url>
    <loc>${SITE_URL}/#${section}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `\n\n  <!-- Blog Posts -->`;

    // Add Blog Posts
    blogPosts?.forEach(post => {
      const lastMod = new Date(post.updated_at || post.published_at).toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `\n\n  <!-- News Posts -->`;

    // Add News Posts
    newsPosts?.forEach(post => {
      const lastMod = new Date(post.updated_at || post.published_at).toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${SITE_URL}/news/${post.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    // Write file
    const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
    writeFileSync(sitemapPath, xml, 'utf-8');

    console.log('✅ Sitemap generated successfully at:', sitemapPath);
    console.log('\n📊 Stats:');
    console.log(`   - Static Routes: ${STATIC_ROUTES.length}`);
    console.log(`   - Navigation Sections: ${NAVIGATION_SECTIONS.length}`);
    console.log(`   - Blog Posts: ${blogPosts?.length || 0}`);
    console.log(`   - News Posts: ${newsPosts?.length || 0}`);
    console.log(`   - Total URLs: ${STATIC_ROUTES.length + NAVIGATION_SECTIONS.length + (blogPosts?.length || 0) + (newsPosts?.length || 0)}`);

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
