# Team Apex Admin Panel

> Enterprise Management Console for [Team Apex Platform](https://team-apex-nine.vercel.app)

A modern, high-performance Admin Console designed with dark glassmorphism styling, responsive sidebar navigation, glowing spotlight inputs, instant page prefetching, and full dynamic CRUD management.

---

## 🌐 Live Deployments

- **Admin Dashboard**: [https://team-apex-admin.vercel.app/dashboard](https://team-apex-admin.vercel.app/dashboard)
- **Main Website**: [https://team-apex-nine.vercel.app](https://team-apex-nine.vercel.app)
- **Deployment Guide**: See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## ✨ Features & Management Modules

1. **Authentication & Session Management**:
   - `login.html`: Login with demo auto-fill shortcut and JWT session persistence.
   - `register.html`: Register new team accounts with role selection (`ADMIN`, `CORE_MEMBER`, `MEMBER`).
   - `auth.js`: Session tokens and RBAC guards (`guardAdmin` & `guardModerator`).

2. **Management Modules**:
   - **Dashboard (`/dashboard`)**: Key metrics (Projects, Hackathons, Members, Posts, Messages), activity feed.
   - **Projects (`/projects`)**: Full CRUD (title, tagline, year, status, problem, solution, GitHub/Demo/Docs URLs).
   - **Hackathons (`/hackathons`)**: Full CRUD (name, organizer, date, description, challenge, result, certificates).
   - **Achievements (`/achievements`)**: Full CRUD (title, award date, issuer, verification link, details).
   - **Community Posts (`/posts`)**: Full CRUD (type, status, title, body, author).
   - **Messages Inbox (`/messages`)**: Read contact inquiries, filter by status, and use **In-App Message Reply Modal** to respond directly to users.
   - **Team Members (`/users`)**: Manage member accounts, role levels (`ADMIN`, `CORE_MEMBER`), and bio/social links.
   - **Events (`/events`)**: Manage workshops and tech talks (date, location, registration link, status).
   - **Resources (`/resources`)**: Manage developer resources and learning guides.

3. **Performance & Vercel Optimization**:
   - `vercel.json`: Clean URL rewrites (`/dashboard`, `/projects`, etc.) and Vercel CDN caching headers.
   - `fast-nav.js`: Instant page prefetching on link hover/touch/focus for 0ms transition delays.
   - `logo.webp`: Optimized brand assets (28 KB WebP).
   - `.github/workflows/ci.yml`: GitHub Actions CI pipeline ensuring 100% green checkmarks (`✓`).

---

## 📜 License
Licensed under the [MIT License](LICENSE).
