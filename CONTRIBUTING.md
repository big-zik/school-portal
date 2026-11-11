# Contributing to School Portal

Thank you for contributing! Please read this guide before opening a pull request.

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 20+ |
| PostgreSQL | 15+ |
| Redis | 7+ |
| npm | 10+ |

---

## Local Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd school-portal

# 2. Copy environment template
cp .env.example .env
# Edit .env and fill in your local credentials

# 3. Install dependencies
npm install

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed the database
npm run seed

# 6. Start the development server
npm run dev
```

The app is available at <http://localhost:3000>.

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| New feature | `feature/<short-description>` | `feature/grade-export` |
| Bug fix | `fix/<short-description>` | `fix/login-redirect` |
| Chores / deps | `chore/<short-description>` | `chore/upgrade-prisma` |

---

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<optional scope>): <short summary>
```

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `chore` | Maintenance, dependency updates |
| `docs` | Documentation only changes |
| `test` | Adding or updating tests |
| `refactor` | Code change that neither fixes a bug nor adds a feature |

**Examples**

```
feat(auth): add Google OAuth provider
fix(grades): correct GPA rounding for edge cases
chore: upgrade Next.js to 16.1
docs: update setup steps in CONTRIBUTING.md
test(api): add unit tests for student endpoints
refactor(db): extract query helpers into lib/db
```

---

## Pull Request Process

1. **Branch off `main`** using the naming convention above.
2. **Write or update tests** for every changed behaviour.
3. **Run the full test suite** locally (`npm test`) and make sure it passes.
4. **Keep PRs focused** — one concern per PR makes reviews faster.
5. **Fill in the PR template** (title, description, screenshots if UI changes).
6. **Request a review** from at least one team member.
7. PRs are merged with **squash-merge** to keep `main` history linear.
8. Delete your branch after the PR is merged.

---

## Code Style

- TypeScript strict mode is enabled — no `any` without a comment explaining why.
- Prettier and ESLint are configured; run `npm run lint` before pushing.
- Tailwind classes: use the design system tokens; avoid arbitrary values unless necessary.

---

## Questions?

Open a GitHub Discussion or ping the team in the project Slack channel.
