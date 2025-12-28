# Next.js Migration - 97harsh.github.io

This is a Next.js migration of the Jekyll-based personal website, optimized for minimal maintenance and modern development.

## Architecture

- **Framework**: Next.js 14.x with Pages Router (NOT App Router for stability)
- **Rendering**: 100% Static Site Generation (SSG)
- **Styling**: Existing CSS preserved (Poole + Hyde + Custom)
- **State Management**: React Context (no external libraries)
- **Type Safety**: TypeScript throughout
- **Dependencies**: Minimal (8 core packages)

## Phase 1: Foundation ✅

**Completed:**
- ✅ Next.js 14.x initialization with TypeScript and Pages Router
- ✅ Folder structure setup (pages, components, lib, styles, content)
- ✅ CSS migration (poole.css, hyde.css, custom.css, syntax.css)
- ✅ FontContext implementation (replaces 428 lines of vanilla JS with 30 lines)
- ✅ Sidebar component (converted from Liquid template)
- ✅ WelcomeModal component (font selection on first visit)
- ✅ Layout component with Head management
- ✅ Asset migration to public directory

**Features Working:**
- Font toggle system (Default ↔ OpenDyslexic)
- Welcome modal on first visit
- Sidebar navigation
- localStorage persistence for font preferences
- Responsive design

## Next Phases

### Phase 2: Content Migration (Week 2)
- [ ] Copy all 14 markdown posts to `content/posts/`
- [ ] Implement `lib/posts.ts` with type-safe frontmatter
- [ ] Create `pages/posts/[slug].tsx` for dynamic routing
- [ ] Set up URL redirects (/:year/:month/:day/:slug → /posts/:slug)
- [ ] Validate all posts build correctly

### Phase 3: Features (Week 3)
- [ ] Tag filtering (`pages/tags/[tag].tsx`)
- [ ] Pagination (`pages/page/[number].tsx`)
- [ ] About, Resume, Certifications pages
- [ ] Google Analytics integration
- [ ] Vega chart support

### Phase 4: TensorFlow.js & Games (Week 4)
- [ ] Dynamic import pattern for TensorFlow.js
- [ ] Code splitting strategy
- [ ] Game hosting setup

### Phase 5: Deploy & Optimize (Week 5)
- [ ] Deploy to Vercel
- [ ] Performance optimization
- [ ] Lighthouse audits (target: 95+)
- [ ] Parallel deployment with Jekyll

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
cd nextjs-site
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

Generates static files in the `out/` directory.

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run validate` - Run all checks before deploy

## Project Structure

```
nextjs-site/
├── components/          # React components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── WelcomeModal.tsx # First-visit font selection
├── contexts/            # React contexts
│   └── FontContext.tsx # Font preference state
├── pages/               # Next.js routes
│   ├── _app.tsx        # App wrapper with providers
│   ├── _document.tsx   # HTML document structure
│   └── index.tsx       # Homepage
├── styles/              # CSS files
│   ├── poole.css       # Base styles
│   ├── hyde.css        # Sidebar theme
│   ├── custom.css      # Custom styles
│   ├── syntax.css      # Code highlighting
│   └── globals.css     # Global styles
├── content/             # Markdown content
│   └── posts/          # Blog posts (to be migrated)
├── lib/                 # Utilities
│   └── posts.ts        # Content loading (to be created)
├── public/              # Static assets
│   └── assets/         # Images, etc.
├── next.config.js      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies
```

## Key Features

### Font Accessibility System
- Default font (PT Sans) vs OpenDyslexic font
- Welcome modal prompts users to choose on first visit
- Sidebar toggle button to switch fonts anytime
- Preference persisted in localStorage
- Hydration-safe implementation (no SSR issues)

### Minimal Dependencies
Only 8 core packages:
1. `next` - Framework
2. `react` + `react-dom` - Required
3. `gray-matter` - Frontmatter parsing
4. `remark` + `remark-html` - Markdown processing
5. `date-fns` - Date utilities
6. `typescript` - Type safety

### Static Export
- Configured for `output: 'export'` in `next.config.js`
- Can deploy to GitHub Pages, Netlify, Vercel, or any static host
- No server required

## Why This Architecture?

1. **Pages Router over App Router**: 5+ years of stability, fewer breaking changes
2. **Static Generation**: No server maintenance, fast performance
3. **Minimal Dependencies**: Reduced attack surface, easier updates
4. **TypeScript**: Catch errors at build time
5. **Existing CSS**: Zero migration risk, proven styles
6. **React Context**: No heavy state library needed for simple font toggle

## Maintenance

### Adding New Content
Once content migration is complete:

```bash
# 1. Create markdown file
touch content/posts/2025-01-15-new-post.md

# 2. Add frontmatter + content
# 3. Build and deploy
npm run build
```

### Updating Dependencies
Only update when security-critical or for compelling features:

```bash
npm outdated
# Review changelog
npm update
npm run validate
```

## Migration Progress

- [x] Phase 1: Foundation (COMPLETED)
- [ ] Phase 2: Content Migration
- [ ] Phase 3: Features
- [ ] Phase 4: TensorFlow.js & Games
- [ ] Phase 5: Deploy & Optimize

## Success Criteria

### Technical Metrics
- [ ] All 14 posts accessible and rendering correctly
- [ ] Lighthouse Performance: 95+
- [ ] Lighthouse Accessibility: 95+
- [ ] Lighthouse SEO: 95+
- [ ] Build time: <2 minutes
- [ ] Initial bundle size: <150KB
- [ ] Zero TypeScript errors
- [ ] Zero console errors

### User Experience
- [x] Font toggle works on all pages
- [x] Welcome modal appears exactly once
- [ ] Mobile responsive (tested on 3+ devices)
- [ ] Fast page transitions (<1 second)
- [ ] All images load correctly
- [ ] Tag filtering works
- [ ] Pagination works

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Vercel auto-detects Next.js configuration
3. Deploy automatically on push to main

### GitHub Pages
1. Build: `npm run build`
2. Push `out/` directory to `gh-pages` branch

### Netlify
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `out`

## Troubleshooting

### Hydration Errors
The FontContext is designed to avoid hydration mismatches by not reading localStorage until after the component mounts.

### Missing Assets
Ensure all assets are in the `public/` directory. Next.js serves these files from the root URL.

### TypeScript Errors
Run `npm run type-check` to see all type errors. Fix before deploying.

## References

- [Migration Plan](/Users/harsh/.claude/plans/valiant-exploring-summit.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Pages Router Guide](https://nextjs.org/docs/pages)

## License

Same as original Jekyll site.
