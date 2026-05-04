import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFont } from '@/contexts/FontContext';

const siteConfig = {
  title: 'Harsh Sharma',
  description: 'Progress lies in the pursuit of better problems, sometimes powered by data.',
  author: {
    name: 'Harsh Sharma',
    github: '97harsh',
    email: 'harshsrharsh@gmail.com',
    linkedin: 'sharma-ai',
  },
};

const navPages = [
  { title: 'About', url: '/about' },
  { title: 'Blogs', url: '/blogs' },
  { title: 'Certifications', url: '/certifications' },
  { title: 'Projects', url: '/projects' },
  { title: 'Resume', url: '/resume' },
];

export default function Sidebar() {
  const router = useRouter();
  const { font, setFont } = useFont();

  const toggleFont = () => {
    setFont(font === 'default' ? 'opendyslexic' : 'default');
  };

  const isActive = (url: string) => {
    return router.pathname === url;
  };

  return (
    <>
      <label htmlFor="sidebar-checkbox">Toggle sidebar</label>
      <input type="checkbox" className="sidebar-checkbox" id="sidebar-checkbox" />

      <div className="sidebar" id="sidebar">
        <div id="sidebar-logo" style={{ textAlign: 'center' }}>
          <Link href="/">
            <img src="/assets/images/me.webp" alt="A photo of Me(Harsh Sharma)" />
          </Link>
        </div>

        <div className="sidebar-item" style={{ textAlign: 'center' }}>
          <p>
            <Link href="/">{siteConfig.author.name}</Link>
          </p>
          <p>{siteConfig.description}</p>
        </div>

        {/* Font Toggle Button */}
        <div
          className="sidebar-item"
          id="font-toggle-container"
          style={{ textAlign: 'center', margin: '1rem 0' }}
        >
          <div className="font-toggle" id="font-toggle" onClick={toggleFont} style={{ cursor: 'pointer' }}>
            <i className="fa fa-font"></i>
            <span>Toggle Font</span>
          </div>
        </div>

        <div className="sidebar-item" id="contact-list" style={{ textAlign: 'center' }}>
          <a href={`https://www.github.com/${siteConfig.author.github}`} target="_blank" rel="noopener noreferrer">
            <i className="fa fa-github fa-lg"></i>
          </a>

          <a
            href={`https://www.linkedin.com/in/${siteConfig.author.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa fa-linkedin-square fa-lg"></i>
          </a>

          <a href={`mailto:${siteConfig.author.email}`} target="_blank" rel="noopener noreferrer">
            <i className="fa fa-envelope fa-lg"></i>
          </a>

          <a
            href="https://drive.google.com/file/d/1dNTXLqY7BK2ifxx7L-n0_mo-EC6-cTxa/view"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa fa-file-pdf-o fa-lg"></i>
          </a>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className={`sidebar-nav-item${isActive('/') ? ' active' : ''}`}>
            Home
          </Link>

          {navPages.map((page) => (
            <Link
              key={page.url}
              href={page.url}
              className={`sidebar-nav-item${isActive(page.url) ? ' active' : ''}`}
            >
              {page.title}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
