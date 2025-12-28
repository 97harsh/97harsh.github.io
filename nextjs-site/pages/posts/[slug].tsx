import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { getAllPosts, getPostBySlug, getRelatedPosts, Post } from '@/lib/posts';

interface PostPageProps {
  post: Post;
  relatedPosts: Post[];
}

export default function PostPage({ post, relatedPosts }: PostPageProps) {
  if (!post) {
    return (
      <div className="post">
        <h1>Post not found</h1>
        <p>The requested post could not be loaded.</p>
      </div>
    );
  }

  const formattedDate = format(new Date(post.frontmatter.date), 'MMMM d, yyyy');

  return (
    <>
      <Head>
        <title>{post.frontmatter.title} | Harsh Sharma</title>
        <meta name="description" content={post.frontmatter.description} />
      </Head>

      <article className="post">
        <h1 className="post-title">{post.frontmatter.title}</h1>

        <div className="post-meta">
          <time dateTime={post.frontmatter.date}>{formattedDate}</time>
          {post.frontmatter.type && (
            <span className="post-type"> · {post.frontmatter.type}</span>
          )}
        </div>

        {post.frontmatter.description && (
          <p
            className="post-description"
            dangerouslySetInnerHTML={{ __html: `<em>${post.frontmatter.description}</em>` }}
          />
        )}

        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.htmlContent }}
        />

        {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
          <div className="post-tags">
            <strong>Tags:</strong>{' '}
            {post.frontmatter.tags.map((tag, index) => (
              <span key={tag}>
                <Link href={`/tags/${tag}`}>{tag}</Link>
                {index < post.frontmatter.tags.length - 1 && ', '}
              </span>
            ))}
          </div>
        )}
      </article>

      {relatedPosts.length > 0 && (
        <aside className="related">
          <h3>Related Posts</h3>
          <ul className="related-posts">
            {relatedPosts.map(relatedPost => (
              <li key={relatedPost.slug}>
                <h4>
                  <Link href={`/posts/${relatedPost.slug}`}>
                    {relatedPost.frontmatter.title}
                  </Link>
                </h4>
                <small>
                  {format(new Date(relatedPost.frontmatter.date), 'MMMM d, yyyy')}
                </small>
                {relatedPost.frontmatter.description && (
                  <p>{relatedPost.frontmatter.description}</p>
                )}
              </li>
            ))}
          </ul>
        </aside>
      )}

      <style jsx>{`
        .post-meta {
          color: #9a9a9a;
          margin-bottom: 1rem;
        }

        .post-description {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 2rem;
        }

        .post-content {
          margin-bottom: 2rem;
        }

        .post-tags {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .post-tags a {
          color: #ac4142;
          text-decoration: none;
        }

        .post-tags a:hover {
          text-decoration: underline;
        }

        .related {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }

        .related h3 {
          margin-bottom: 1rem;
        }

        .related-posts {
          list-style: none;
          padding: 0;
        }

        .related-posts li {
          margin-bottom: 1.5rem;
        }

        .related-posts h4 {
          margin: 0;
        }

        .related-posts a {
          color: #268bd2;
          text-decoration: none;
        }

        .related-posts a:hover {
          text-decoration: underline;
        }

        .related-posts small {
          color: #9a9a9a;
        }

        .related-posts p {
          margin: 0.5rem 0 0 0;
          font-size: 0.9rem;
          color: #666;
        }
      `}</style>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts();

  return {
    paths: posts.map(post => ({
      params: { slug: post.slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  const relatedPosts = getRelatedPosts(slug, 3);

  return {
    props: {
      post,
      relatedPosts,
    },
  };
};
