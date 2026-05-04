import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { getPaginatedPosts, Post } from '@/lib/posts';
import PostCard from '@/components/PostCard';

interface HomeProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

export default function Home({ posts, currentPage, totalPages, hasNextPage }: HomeProps) {
  return (
    <>
      <Head>
        <title>Harsh Sharma</title>
        <meta
          name="description"
          content="A personal website showcasing my open source projects, work experience, and publications."
        />
      </Head>

      <div className="posts">
        {posts.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 1 && (
            <Link href={currentPage === 2 ? '/' : `/page/${currentPage - 1}`} className="pagination-item">
              ← Newer
            </Link>
          )}
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          {hasNextPage && (
            <Link href={`/page/${currentPage + 1}`} className="pagination-item">
              Older →
            </Link>
          )}
        </div>
      )}

      <style jsx>{`
        .posts {
          margin-bottom: 2rem;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }

        .pagination :global(.pagination-item) {
          color: #268bd2;
          text-decoration: none;
          font-weight: 500;
        }

        .pagination :global(.pagination-item:hover) {
          text-decoration: underline;
        }

        .pagination-info {
          color: #9a9a9a;
        }
      `}</style>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const { posts, currentPage, totalPages, hasNextPage } = getPaginatedPosts(1, 5);

  return {
    props: {
      posts,
      currentPage,
      totalPages,
      hasNextPage,
    },
  };
};
