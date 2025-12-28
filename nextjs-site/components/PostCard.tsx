import Link from 'next/link';
import { format } from 'date-fns';
import { Post } from '@/lib/posts';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const formattedDate = format(new Date(post.frontmatter.date), 'MMMM d, yyyy');

  return (
    <div className="post-card">
      <h2 className="post-title">
        <Link href={`/posts/${post.slug}`}>{post.frontmatter.title}</Link>
      </h2>

      <span className="post-date">{formattedDate}</span>

      {post.frontmatter.description && (
        <p
          className="post-description"
          dangerouslySetInnerHTML={{ __html: post.frontmatter.description }}
        />
      )}

      {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
        <div className="post-tags">
          {post.frontmatter.tags.map(tag => (
            <Link key={tag} href={`/tags/${tag}`} className="tag">
              {tag}
            </Link>
          ))}
        </div>
      )}

      <Link href={`/posts/${post.slug}`} className="read-more">
        Read more →
      </Link>

      <style jsx>{`
        .post-card {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #eee;
        }

        .post-card:last-child {
          border-bottom: none;
        }

        .post-title {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .post-title :global(a) {
          color: #303030;
          text-decoration: none;
        }

        .post-title :global(a:hover),
        .post-title :global(a:focus) {
          color: #268bd2;
          text-decoration: none;
        }

        .post-date {
          display: block;
          margin-bottom: 1rem;
          color: #9a9a9a;
        }

        .post-description {
          margin-bottom: 1rem;
          color: #515151;
        }

        .post-tags {
          margin-bottom: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .post-tags :global(.tag) {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          font-size: 0.85rem;
          background: #f5f5f5;
          border-radius: 3px;
          color: #666;
          text-decoration: none;
          transition: background 0.2s;
        }

        .post-tags :global(.tag:hover) {
          background: #e5e5e5;
          color: #333;
        }

        .read-more {
          color: #268bd2;
          text-decoration: none;
          font-weight: 500;
        }

        .read-more:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
