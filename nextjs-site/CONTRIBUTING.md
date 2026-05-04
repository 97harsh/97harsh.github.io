# Contributing to Next.js Migration

## Branch Strategy

### Main Branches
- `master` - Production Jekyll site (current live site)
- `nextjs-migration` - Next.js migration base branch (Phase 1 foundation)

### Feature Branches
All new changes should be made on feature branches created from `nextjs-migration`:

```bash
# Start from nextjs-migration
git checkout nextjs-migration
git pull origin nextjs-migration

# Create feature branch
git checkout -b feature/content-migration
# or
git checkout -b feature/tag-filtering
# or
git checkout -b fix/ssr-hydration
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout nextjs-migration
git pull origin nextjs-migration
git checkout -b feature/your-feature-name
```

### 2. Make Changes

```bash
# Make your changes
cd nextjs-site
npm run dev  # Test locally

# Validate before committing
npm run type-check
npm run lint
npm run build
```

### 3. Commit Changes

```bash
git add .
git commit -m "Description of changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 4. Push and Create PR

```bash
git push -u origin feature/your-feature-name

# Create PR targeting nextjs-migration (NOT master)
gh pr create --title "Feature: Your Feature" --base nextjs-migration
```

## PR Guidelines

### PR Target
- ✅ **Target**: `nextjs-migration` branch
- ❌ **NOT**: `master` branch

### PR Checklist
- [ ] Code builds successfully (`npm run build`)
- [ ] TypeScript type check passes (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Tested locally with `npm run dev`
- [ ] Documentation updated if needed
- [ ] Commit messages follow format

### PR Title Format
- `Feature: Add content migration system`
- `Fix: SSR hydration error in FontContext`
- `Chore: Update dependencies`
- `Docs: Update README with deployment steps`

## Testing Locally

### Install Dependencies
```bash
cd nextjs-site
npm install
```

### Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

### Build for Production
```bash
npm run build
# Outputs to out/ directory
```

### Full Validation
```bash
npm run validate
# Runs: type-check + lint + build
```

## Deployment

### Vercel (Automatic)
- Pushes to `nextjs-migration` auto-deploy to Vercel preview
- Merges to `master` (when ready) will deploy to production

### Manual Testing
1. Build locally: `npm run build`
2. Serve build: `npx serve out`
3. Test at http://localhost:3000

## Migration Phases

### ✅ Phase 1: Foundation (COMPLETED)
- Branch: `nextjs-migration`
- Next.js setup, components, font toggle

### 🚧 Phase 2: Content Migration (NEXT)
- Branch: `feature/content-migration`
- Copy 14 blog posts
- Implement `lib/posts.ts`
- Dynamic routing

### 📋 Phase 3: Features (PLANNED)
- Branch: `feature/tag-filtering`
- Branch: `feature/pagination`
- Tag system, pagination, static pages

### 🎮 Phase 4: TensorFlow.js (PLANNED)
- Branch: `feature/tfjs-integration`
- Dynamic imports, code splitting

### 🚀 Phase 5: Deploy (PLANNED)
- Branch: `feature/optimization`
- Performance tuning, Lighthouse audits

## Common Commands

```bash
# Switch to migration branch
git checkout nextjs-migration

# Create new feature branch
git checkout -b feature/my-feature

# Install dependencies
cd nextjs-site && npm install

# Start dev server
npm run dev

# Run all checks
npm run validate

# Create PR to nextjs-migration
gh pr create --base nextjs-migration

# Update from nextjs-migration
git checkout feature/my-feature
git pull origin nextjs-migration
```

## Questions?

- Check [README.md](README.md) for project documentation
- Check [MIGRATION_STATUS.md](../MIGRATION_STATUS.md) for progress
- Check [Migration Plan](../.claude/plans/valiant-exploring-summit.md) for architecture

## Contact

- GitHub: [@97harsh](https://github.com/97harsh)
- Email: harshsrharsh@gmail.com
