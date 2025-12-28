import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

// Type-safe frontmatter interface matching Jekyll posts
export interface PostFrontmatter {
  title: string;
  description: string;
  type: 'blog' | 'project';
  tags: string[];
  date: string;
  layout?: string;
  image?: string;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  htmlContent: string;
}

/**
 * Get all posts sorted by date (newest first)
 * Excludes drafts (files starting with 'draft-')
 */
export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory);

  const allPosts = fileNames
    .filter(fileName => {
      // Filter out drafts and non-markdown files
      return fileName.endsWith('.md') && !fileName.startsWith('draft-');
    })
    .map(fileName => {
      // Extract slug from filename (remove date prefix and .md)
      // e.g., "2024-05-05-tfjs-webcam-classify.md" -> "tfjs-webcam-classify"
      const slug = fileName
        .replace(/^\d{4}-\d{2}-\d{2}-/, '')
        .replace(/\.md$/, '');

      return getPostBySlug(slug);
    })
    .filter((post): post is Post => post !== null);

  // Sort by date descending (newest first)
  return allPosts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime();
    const dateB = new Date(b.frontmatter.date).getTime();
    return dateB - dateA;
  });
}

/**
 * Get a single post by slug
 * Returns null if not found
 */
export function getPostBySlug(slug: string): Post | null {
  try {
    // Find the file that matches the slug
    const fileNames = fs.readdirSync(postsDirectory);
    const fileName = fileNames.find(fn => {
      const fileSlug = fn
        .replace(/^\d{4}-\d{2}-\d{2}-/, '')
        .replace(/\.md$/, '');
      return fileSlug === slug && !fn.startsWith('draft-');
    });

    if (!fileName) {
      return null;
    }

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Parse frontmatter and content
    const { data, content } = matter(fileContents);

    // Convert markdown to HTML
    const processedContent = remark()
      .use(html, { sanitize: false })
      .processSync(content);
    const htmlContent = processedContent.toString();

    // Validate frontmatter has required fields
    const frontmatter = data as PostFrontmatter;
    if (!frontmatter.title || !frontmatter.date || !frontmatter.type) {
      console.error(`Invalid frontmatter in ${fileName}`);
      return null;
    }

    return {
      slug,
      frontmatter,
      content,
      htmlContent,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all posts filtered by tag
 */
export function getPostsByTag(tag: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post =>
    post.frontmatter.tags?.includes(tag)
  );
}

/**
 * Get all posts filtered by type (blog or project)
 */
export function getPostsByType(type: 'blog' | 'project'): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post => post.frontmatter.type === type);
}

/**
 * Get all unique tags from all posts
 */
export function getAllTags(): string[] {
  const allPosts = getAllPosts();
  const tagsSet = new Set<string>();

  allPosts.forEach(post => {
    post.frontmatter.tags?.forEach(tag => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

/**
 * Get paginated posts
 * @param page - Page number (1-indexed)
 * @param perPage - Posts per page (default: 5)
 */
export function getPaginatedPosts(page: number, perPage: number = 5): {
  posts: Post[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * Get related posts based on shared tags
 * @param currentSlug - Slug of current post
 * @param limit - Maximum number of related posts (default: 3)
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3): Post[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];

  const allPosts = getAllPosts();
  const currentTags = currentPost.frontmatter.tags || [];

  // Score posts by number of shared tags
  const scoredPosts = allPosts
    .filter(post => post.slug !== currentSlug)
    .map(post => {
      const sharedTags = post.frontmatter.tags?.filter(tag =>
        currentTags.includes(tag)
      ).length || 0;
      return { post, score: sharedTags };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredPosts.slice(0, limit).map(({ post }) => post);
}
