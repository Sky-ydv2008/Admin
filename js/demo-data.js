/**
 * Apex Innovators — demo-data.js
 * Built-in read-only dataset used when the site is served without the API
 * (GitHub Pages / file:// or ?demo=1). Mirrors database/seed.sql and the
 * public REST contract in docs/api.md so every public page renders real
 * content. Mutating/account endpoints resolve to errors explaining that the
 * demo preview has no accounts — the live backend (backend/ + MySQL) adds them.
 *
 * Router output contract: returns the payload, or { __demoError: { status, message } }.
 */

const T = {
  IntelliERP: {
    id: 1,
    title: "IntelliERP",
    slug: "intellierp",
    tagline: "AI-powered ERP & Business Intelligence for small businesses",
    description:
      "IntelliERP pairs a Mini ERP Core with an Analytics Dashboard and an AI Business Advisor. Built for the Build With 2.0 hackathon, it gives small businesses a single pane of glass over products, inventory, purchases, sales, expenses and employees — with rule-based predictive intelligence that runs without any external AI dependency.",
    problem:
      "Small businesses operate on spreadsheets and gut feeling. They lack actionable visibility into inventory risk, supplier reliability and overall business health, and affordable ERP tools are built for enterprises, not for them.",
    solution:
      "A role-based Mini ERP Core (products, inventory, purchases, sales, expenses, employees) plus Analytics Dashboard and AI Business Advisor. Stockout forecasting, supplier-loss detection and automatic product classification run as transparent rule-based algorithms over transactional data — fully self-contained.",
    status: "PUBLISHED",
    featured: true,
    githubUrl: "https://github.com/Sky-ydv2008/ai-powered-mini-erp",
    demoUrl: "https://apex-innovators.onrender.com/",
    docsUrl: null,
    year: 2026,
    technologies: [
      { id: 1, name: "Java", category: "Language", icon: "devicon-java" },
      { id: 5, name: "Spring Boot", category: "Framework", icon: "devicon-spring" },
      { id: 6, name: "Spring Security", category: "Security", icon: "devicon-spring" },
      { id: 7, name: "JWT", category: "Security", icon: "shield" },
      { id: 8, name: "MySQL", category: "Database", icon: "devicon-mysql" },
      { id: 12, name: "Hibernate / JPA", category: "Database", icon: "database" },
      { id: 9, name: "Maven", category: "Tooling", icon: "devicon-maven" },
      { id: 2, name: "JavaScript", category: "Language", icon: "devicon-javascript" },
      { id: 3, name: "HTML5", category: "Frontend", icon: "devicon-html5" },
      { id: 4, name: "CSS3", category: "Frontend", icon: "devicon-css3" },
      { id: 10, name: "REST APIs", category: "Integration", icon: "server" },
      { id: 11, name: "Swagger / OpenAPI", category: "Docs", icon: "file-code" },
    ],
    members: [
      { userId: 1, name: "Shivam Yadav", role: "Java Backend Developer", contribution: "Spring Boot REST APIs, Spring Security + JWT, predictive inventory logic" },
      { userId: 2, name: "Lipsarani Bisoyi", role: "Frontend Developer", contribution: "UI, design system and client-side integration" },
      { userId: 3, name: "Aryan Gupta", role: "Full Stack Developer", contribution: "Full stack integration, decision engine testing & cloud deployment" },
    ],
    hackathons: [{ id: 1, name: "Build With 2.0" }],
    createdAt: "2026-09-01T09:00:00",
  },
  "Hack Night Bot": {
    id: 2,
    title: "Hack Night Bot",
    slug: "hack-night-bot",
    tagline: "Bot for hackathon teams",
    description: "A helper bot that keeps hackathon teams on track during long builds — reminders, standups and deploy pings.",
    problem: "Teams lose momentum and forget breaks during 24-hour hackathons.",
    solution: "A lightweight bot that runs structured standups, reminds the team to commit and celebrate, and nudges healthy breaks.",
    status: "PUBLISHED",
    featured: false,
    githubUrl: null,
    demoUrl: null,
    docsUrl: null,
    year: 2026,
    technologies: [
      { id: 2, name: "JavaScript", category: "Language", icon: "devicon-javascript" },
      { id: 10, name: "REST APIs", category: "Integration", icon: "server" },
    ],
    members: [{ userId: 3, name: "Aryan Gupta", role: "Full Stack Developer", contribution: "Bot logic, integrations and deployment" }],
    hackathons: [],
    createdAt: "2026-09-02T14:00:00",
  },
};

function loadProjectsFromStorage() {
  try {
    const raw = typeof localStorage !== "undefined" && localStorage.getItem("ai_demo_projects");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        for (const key of Object.keys(T)) delete T[key];
        Object.assign(T, parsed);
      }
    }
  } catch (e) {}
}
loadProjectsFromStorage();


function saveProjectsToStorage() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem("ai_demo_projects", JSON.stringify(T)); } catch (e) {}
}
function saveHackathonsToStorage() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem("ai_demo_hackathons", JSON.stringify(HACKATHONS)); } catch (e) {}
}
function saveAchievementsToStorage() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem("ai_demo_achievements", JSON.stringify(ACHIEVEMENTS)); } catch (e) {}
}
function savePostsToStorage() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem("ai_demo_posts", JSON.stringify(POSTS)); } catch (e) {}
}
function saveMessagesToStorage() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem("ai_demo_messages", JSON.stringify(MESSAGES)); } catch (e) {}
}
function saveUsersToStorage() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem("ai_demo_users", JSON.stringify(DEMO_ACCOUNTS)); } catch (e) {}
}

function loadAllFromStorage() {
  try {
    if (typeof localStorage === "undefined") return;
    const rProj = localStorage.getItem("ai_demo_projects");
    if (rProj) { const p = JSON.parse(rProj); if (p) { for (const k of Object.keys(T)) delete T[k]; Object.assign(T, p); } }
    const rHack = localStorage.getItem("ai_demo_hackathons");
    if (rHack) { const p = JSON.parse(rHack); if (Array.isArray(p) && p.length) { HACKATHONS.length = 0; HACKATHONS.push(...p); } }
    const rAch = localStorage.getItem("ai_demo_achievements");
    if (rAch) { const p = JSON.parse(rAch); if (Array.isArray(p) && p.length) { ACHIEVEMENTS.length = 0; ACHIEVEMENTS.push(...p); } }
    const rPost = localStorage.getItem("ai_demo_posts");
    if (rPost) { const p = JSON.parse(rPost); if (Array.isArray(p) && p.length) { POSTS.length = 0; POSTS.push(...p); } }
    const rMsg = localStorage.getItem("ai_demo_messages");
    if (rMsg) { const p = JSON.parse(rMsg); if (Array.isArray(p) && p.length) { MESSAGES.length = 0; MESSAGES.push(...p); } }
    const rUser = localStorage.getItem("ai_demo_users");
    if (rUser) { const p = JSON.parse(rUser); if (Array.isArray(p) && p.length) { DEMO_ACCOUNTS.length = 0; DEMO_ACCOUNTS.push(...p); } }
  } catch (e) {}
}
loadAllFromStorage();

const HACKATHON = {
  id: 1,
  name: "Build With 2.0",
  slug: "build-with-2-0",
  organizer: "Parul University",
  date: "2026-09-01T00:00:00",
  description: "Annual university-wide hackathon focusing on real-world software solutions and AI tools.",
  challenge: "Build a functional software solution for real business problems or community needs within 48 hours.",
  result: "1st Place Winner",
  certificateUrl: "https://example.com/certificate",
  presentationUrl: "https://example.com/presentation",
  members: [
    { userId: 1, name: "Shivam Yadav" },
    { userId: 2, name: "Lipsarani Bisoyi" },
    { userId: 3, name: "Aryan Gupta" },
  ],
  projects: [{ id: 1, title: "IntelliERP", slug: "intellierp" }],
  createdAt: "2026-09-01T08:00:00",
};

let HACKATHONS = [HACKATHON];

let MESSAGES = [
  { id: 1, name: "Rahul Verma", email: "rahul@example.com", subject: "Collaboration Inquiry", message: "Hey Apex team, we would love to collaborate on the upcoming hackathon!", status: "NEW", createdAt: "2026-09-03T11:20:00" },
  { id: 2, name: "Priya Sharma", email: "priya@example.com", subject: "Mentorship", message: "Hi! Are you open for mentoring new student devs at PIET?", status: "READ", createdAt: "2026-09-02T15:45:00" }
];
const TEAM = [
  { id: 1, name: "Shivam Yadav", role: "ADMIN", headline: "Java Backend Developer", bio: "Java backend developer on Apex Innovators — Spring Boot, REST APIs, JWT security and the platform core.", photoUrl: null, github: "Sky-ydv2008", linkedin: null },
  { id: 2, name: "Lipsarani Bisoyi", role: "CORE_MEMBER", headline: "Frontend Developer", bio: "Frontend developer on Apex Innovators — crafting the interfaces, design system and user experience.", photoUrl: null, github: null, linkedin: null },
  { id: 3, name: "Aryan Gupta", role: "CORE_MEMBER", headline: "Full Stack Developer", bio: "Full stack developer on Apex Innovators — backend to browser, from database to deployed product.", photoUrl: null, github: null, linkedin: null },
];
export let DEMO_ACCOUNTS = [
  {
    id: 1,
    name: "Shivam Yadav",
    email: "apex.innovator.team@gmail.com",
    password: "Apex@Shivam",
    role: "ADMIN",
    status: "ACTIVE",
    headline: "Java Backend Developer",
    bio: "Java backend developer on Apex Innovators — Spring Boot, REST APIs, JWT security and the platform core.",
    photoUrl: null,
    github: "Sky-ydv2008",
    linkedin: null,
  },
  {
    id: 2,
    name: "Lipsarani Bisoyi",
    email: "bisoyilipsarani@gmail.com",
    password: "Apex@Lipsa",
    role: "CORE_MEMBER",
    status: "ACTIVE",
    headline: "Frontend Developer",
    bio: "Frontend developer on Apex Innovators — crafting the interfaces, design system and user experience.",
    photoUrl: null,
    github: null,
    linkedin: null,
  },
  {
    id: 3,
    name: "Aryan Gupta",
    email: "the.aryangupta10@gmail.com",
    password: "Apex@Aryan",
    role: "CORE_MEMBER",
    status: "ACTIVE",
    headline: "Full Stack Developer",
    bio: "Full stack developer on Apex Innovators — backend to browser, from database to deployed product.",
    photoUrl: null,
    github: null,
    linkedin: null,
  },
];

let ACHIEVEMENTS = [
  {
    id: 1, userId: 1, userName: "Shivam Yadav", title: "Build With 2.0 — IntelliERP", type: "CERTIFICATE",
    issuer: "Build With 2.0 organizers", awardDate: "2026-09-01",
    description: "Certified participation for the AI-Powered ERP & Business Intelligence problem statement.", verifyUrl: null,
  },
];

const TECHNOLOGIES = [
  { id: 1, name: "Java", category: "Language", icon: "devicon-java" },
  { id: 2, name: "JavaScript", category: "Language", icon: "devicon-javascript" },
  { id: 3, name: "HTML5", category: "Frontend", icon: "devicon-html5" },
  { id: 4, name: "CSS3", category: "Frontend", icon: "devicon-css3" },
  { id: 5, name: "Spring Boot", category: "Framework", icon: "devicon-spring" },
  { id: 6, name: "Spring Security", category: "Security", icon: "devicon-spring" },
  { id: 7, name: "JWT", category: "Security", icon: "shield" },
  { id: 8, name: "MySQL", category: "Database", icon: "devicon-mysql" },
  { id: 9, name: "Maven", category: "Tooling", icon: "devicon-maven" },
  { id: 10, name: "REST APIs", category: "Integration", icon: "server" },
  { id: 11, name: "Swagger / OpenAPI", category: "Docs", icon: "file-code" },
  { id: 12, name: "Hibernate / JPA", category: "Database", icon: "database" },
  { id: 13, name: "Git / GitHub", category: "Tooling", icon: "devicon-github" },
];

let POSTS = [
  {
    id: 1, authorId: 1, authorName: "Shivam Yadav", type: "ANNOUNCEMENT", title: "IntelliERP is live on the showcase",
    body: "Our Build With 2.0 project is now published — full problem statement, solution walkthrough and build story on the project page. Feedback welcome in the comments.",
    status: "PUBLISHED", createdAt: "2026-09-02T10:00:00", commentCount: 2, likeCount: 4, likedByMe: false,
  },
  {
    id: 2, authorId: 3, authorName: "Aryan Gupta", type: "DISCUSSION", title: "How do you structure a 48-hour build?",
    body: "Splitting work across a hackathon weekend is half the battle — what works for your team?",
    status: "PUBLISHED", createdAt: "2026-09-02T18:30:00", commentCount: 1, likeCount: 2, likedByMe: false,
  },
];

const COMMENTS = {
  1: [
    { id: 1, authorId: 2, authorName: "Lipsarani Bisoyi", body: "Great write-up — the stockout logic is a clever touch.", createdAt: "2026-09-02T11:00:00" },
    { id: 2, authorId: 3, authorName: "Aryan Gupta", body: "Would love to see the dashboard screenshots soon.", createdAt: "2026-09-02T12:15:00" },
  ],
  2: [
    { id: 3, authorId: 1, authorName: "Shivam Yadav", body: "Plan the DB schema first, then split features by module.", createdAt: "2026-09-02T19:00:00" },
  ],
};

const STATS = { projects: 2, hackathons: 1, members: 3, technologies: 13, achievements: 1 };


function err(status, message) {
  return { __demoError: { status, message } };
}

function page(items, page, size) {
  const p = Number(page || 0);
  const s = Number(size || 12);
  const start = p * s;
  const content = items.slice(start, start + s);
  return {
    content,
    page: p,
    size: s,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / s)),
  };
}

function qMatch(needle, ...fields) {
  const q = (needle || "").trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => String(f || "").toLowerCase().includes(q));
}

export function demoFetch(method, path, params = {}, body = {}) {
  const seg = path.split("/").filter(Boolean); // ["projects", "intellierp"] or ["public","stats"]
  const base = seg[0];

  // Public reads -----------------------------------------------------
  if (method === "GET" && base === "public" && seg[1] === "stats") return STATS;
  if (method === "GET" && base === "technologies") return TECHNOLOGIES;

  if (method === "GET" && base === "projects") {
    if (seg.length === 1) {
      let items = Object.values(T).filter((p) => p.status === "PUBLISHED");
      if (params.featured === "true" || params.featured === true) items = items.filter((p) => p.featured);
      if (params.q) items = items.filter((p) => qMatch(params.q, p.title, p.tagline, p.description));
      if (params.tech) items = items.filter((p) => p.technologies.some((t) => String(t.name).toLowerCase() === String(params.tech).toLowerCase()));
      if (params.year) items = items.filter((p) => String(p.year) === String(params.year));
      return page(items, params.page, params.size);
    }
    const hit = Object.values(T).find((p) => String(p.id) === seg[1] || p.slug === seg[1]);
    return hit || err(404, "Project not found");
  }

  if (method === "GET" && base === "hackathons") {
    if (seg.length === 1) return page([HACKATHON], params.page, params.size);
    return (String(HACKATHON.id) === seg[1] || HACKATHON.slug === seg[1]) ? HACKATHON : err(404, "Hackathon not found");
  }

  if (method === "GET" && base === "team") return TEAM;

  if (method === "GET" && base === "achievements") return page(ACHIEVEMENTS, params.page, params.size);

  if (method === "GET" && base === "posts") {
    if (seg.length === 1) {
      let items = POSTS;
      if (params.type) items = items.filter((p) => p.type === params.type);
      return page(items, params.page, params.size);
    }
    if (seg.length === 2) {
      const post = POSTS.find((p) => String(p.id) === seg[1]);
      return post || err(404, "Post not found");
    }
    if (seg[2] === "comments") {
      return COMMENTS[seg[1]] || err(404, "Post not found");
    }
  }

  if (method === "GET" && base === "events") return page([], params.page, params.size);

  if (method === "GET" && base === "search") {
    const q = String(params.q || "").toLowerCase();
    const filter = (items, fields) => items.filter((it) => qMatch(q, ...fields));
    return {
      projects: filter(Object.values(T), "title", "tagline", "description").slice(0, 10),
      hackathons: qMatch(q, HACKATHON.name, HACKATHON.description) ? [HACKATHON] : [],
      posts: filter(POSTS, "title", "body").slice(0, 10),
    };
  }

  // Contact form — pretend it was stored (demo has no inbox) ----------
  if (method === "POST" && base === "contact") {
    const b = body || {};
    return { id: 1, name: b.name || "Guest", email: b.email || "", subject: b.subject || "", message: b.message || "", status: "NEW", createdAt: new Date().toISOString() };
  }

  // Auth endpoints (demo mode) ----------------------------------------
  if (base === "auth") {
    const sub = seg[1];
    if (method === "POST" && sub === "login") {
      const email = String((body && body.email) || "").trim().toLowerCase();
      const pass = String((body && body.password) || "");
      const found = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email);
      if (found && found.password === pass) {
        return {
          token: `demo-token-${found.id}-${Date.now()}`,
          refreshToken: `demo-refresh-${found.id}-${Date.now()}`,
          user: {
            id: found.id,
            name: found.name,
            email: found.email,
            role: found.role,
            status: found.status,
            headline: found.headline,
            bio: found.bio,
            github: found.github,
            linkedin: found.linkedin,
          },
        };
      }
      return err(401, "Incorrect email or password.");
    }

    if (method === "GET" && (sub === "me" || sub === "profile")) {
      try {
        const token = typeof localStorage !== "undefined" ? localStorage.getItem("ai_token") : null;
        const raw = typeof localStorage !== "undefined" ? localStorage.getItem("ai_user") : null;
        if (token && raw) return JSON.parse(raw);
      } catch (e) {}
      return err(401, "Unauthenticated");
    }

    if (method === "PUT" && sub === "profile") {
      let current = null;
      try {
        const raw = typeof localStorage !== "undefined" ? localStorage.getItem("ai_user") : null;
        if (raw) current = JSON.parse(raw);
      } catch (e) {}
      if (!current) return err(401, "Unauthenticated");
      const updated = { ...current, ...(body || {}) };
      try {
        localStorage.setItem("ai_user", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    }

    if ((method === "POST" || method === "PUT") && sub === "password") {
      return { message: "Password updated successfully in demo mode." };
    }

    if (method === "POST" && sub === "register") {
      const newUser = {
        id: Date.now(),
        name: (body && body.name) || "Member",
        email: (body && body.email) || "member@example.com",
        role: "MEMBER",
        status: "ACTIVE",
      };
      return {
        token: `demo-token-${newUser.id}`,
        refreshToken: `demo-refresh-${newUser.id}`,
        user: newUser,
      };
    }

    if (method === "POST" && sub === "logout") {
      return null;
    }
  }

  // Admin endpoints (demo mode) ---------------------------------------
  if (base === "admin") {
    let currentUser = null;
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("ai_token") : null;
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem("ai_user") : null;
      if (raw) currentUser = JSON.parse(raw);
    } catch (e) {}

    if (!token || !currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "CORE_MEMBER")) {
      return err(401, "Unauthorized admin access");
    }
    const sub = seg[1];
    if (sub === "overview") {
      return {
        totalProjects: Object.keys(T).length,
        totalHackathons: HACKATHONS.length,
        totalMembers: DEMO_ACCOUNTS.length,
        publishedPosts: POSTS.filter(p => p.status === "PUBLISHED" || p.status === "PINNED").length,
        pendingProjects: Object.values(T).filter(p => p.status === "PENDING_REVIEW" || p.status === "DRAFT").length,
        pendingPosts: POSTS.filter(p => p.status === "PENDING_REVIEW" || p.status === "DRAFT").length,
        unreadMessages: MESSAGES.filter(m => m.status === "NEW" || m.status === "UNREAD" || m.status === "PENDING").length,
        recentActivity: [
          { id: 1, actor: "Shivam Yadav", action: "PUBLISHED", entity: "IntelliERP", detail: "Case study live", createdAt: "2026-09-02T10:00:00" },
          { id: 2, actor: "Aryan Gupta", action: "SUBMITTED", entity: "Hack Night Bot", detail: "Bot helper live", createdAt: "2026-09-02T14:00:00" },
          { id: 3, actor: "Lipsarani Bisoyi", action: "COMMENTED", entity: "IntelliERP", detail: "Great write-up", createdAt: "2026-09-02T11:00:00" },
        ],
      };
    }

    if (sub === "users") {
      if (seg.length === 2 && method === "GET") {
        let users = DEMO_ACCOUNTS;
        if (params.q) users = users.filter((u) => qMatch(params.q, u.name, u.email, u.headline));
        return page(users, params.page, params.size);
      }
      if (seg.length === 3 && seg[2] === "audit") {
        return page([
          { id: 1, actor: "Shivam Yadav", action: "UPDATE", detail: "Account active", createdAt: new Date().toISOString() }
        ], params.page, params.size);
      }
      if (seg.length === 3 && method === "GET") {
        const u = DEMO_ACCOUNTS.find((a) => String(a.id) === String(seg[2])) || DEMO_ACCOUNTS[0];
        return u;
      }
      if (method === "POST") {
        const newUser = {
          id: Date.now(),
          name: (body && body.name) || "Member",
          email: (body && body.email) || "member@example.com",
          role: (body && body.role) || "MEMBER",
          status: (body && body.status) || "ACTIVE",
          headline: (body && body.headline) || "",
          bio: (body && body.bio) || "",
          github: (body && body.github) || null,
          linkedin: (body && body.linkedin) || null,
        };
        DEMO_ACCOUNTS.push(newUser); saveUsersToStorage();
        return newUser;
      }
      if ((method === "PUT" || method === "PATCH") && seg.length >= 3) {
        const targetId = seg[2];
        const u = DEMO_ACCOUNTS.find((a) => String(a.id) === String(targetId));
        if (u) {
          Object.assign(u, body || {}); saveUsersToStorage();
          return u;
        }
        return { ...(body || {}), id: Number(targetId) || Date.now(), status: "ACTIVE" };
      }
      if (method === "DELETE" && seg.length >= 3) {
        const targetId = seg[2];
        const idx = DEMO_ACCOUNTS.findIndex((a) => String(a.id) === String(targetId));
        if (idx >= 0) DEMO_ACCOUNTS.splice(idx, 1);
        return null;
      }
    }

    if (sub === "projects") {
      if (method === "GET" && seg.length === 2) {
        let items = Object.values(T);
        if (params.q) items = items.filter((p) => qMatch(params.q, p.title, p.tagline, p.description));
        if (params.status) items = items.filter((p) => p.status === params.status);
        return page(items, params.page, params.size);
      }
      if (method === "POST") {
        const id = Date.now();
        const title = (body && body.title) || "New Project";
        const slug = (body && body.slug) || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const newProj = {
          id,
          title,
          slug,
          tagline: (body && body.tagline) || "",
          description: (body && body.description) || "",
          problem: (body && body.problem) || "",
          solution: (body && body.solution) || "",
          status: (body && body.status) || "DRAFT",
          featured: Boolean(body && body.featured),
          githubUrl: (body && body.githubUrl) || null,
          demoUrl: (body && body.demoUrl) || null,
          docsUrl: (body && body.docsUrl) || null,
          year: (body && body.year) || new Date().getFullYear(),
          technologies: (body && body.technologies) || [],
          members: (body && body.members) || [],
          hackathons: [],
          createdAt: new Date().toISOString(),
        };
        T[id] = newProj;
        saveProjectsToStorage();
        return newProj;
      }
      if ((method === "PUT" || method === "PATCH") && seg.length >= 3) {
        const targetId = seg[2];
        let hit = Object.values(T).find((p) => String(p.id) === String(targetId));
        if (hit) {
          Object.assign(hit, body || {});
          saveProjectsToStorage();
          return hit;
        }
        const fallbackProj = { id: Number(targetId) || Date.now(), ...(body || {}), status: (body && body.status) || "PUBLISHED" };
        T[fallbackProj.id] = fallbackProj;
        saveProjectsToStorage();
        return fallbackProj;
      }
      if (method === "DELETE" && seg.length >= 3) {
        const targetId = seg[2];
        for (const k of Object.keys(T)) {
          if (String(T[k].id) === String(targetId)) {
            delete T[k];
            break;
          }
        }
        saveProjectsToStorage();
        return null;
      }
    }

    if (sub === "hackathons") {
      if (method === "GET" && seg.length === 2) {
        return page(HACKATHONS, params.page, params.size);
      }
      if (method === "POST") {
        const name = (body && body.name) || "New Hackathon";
        const newH = {
          id: Date.now(),
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          organizer: (body && body.organizer) || "",
          date: (body && body.date) || new Date().toISOString().slice(0, 10),
          description: (body && body.description) || "",
          challenge: (body && body.challenge) || "",
          result: (body && body.result) || "",
          certificateUrl: (body && body.certificateUrl) || null,
          presentationUrl: (body && body.presentationUrl) || null,
          projects: [],
        };
        HACKATHONS.unshift(newH); saveHackathonsToStorage();
        return newH;
      }
      if (method === "PUT" && seg.length >= 3) {
        const h = HACKATHONS.find((item) => String(item.id) === String(seg[2]));
        if (h) Object.assign(h, body || {}); saveHackathonsToStorage();
        return h || { id: Number(seg[2]), ...(body || {}) };
      }
      if (method === "DELETE" && seg.length >= 3) {
        const idx = HACKATHONS.findIndex((item) => String(item.id) === String(seg[2]));
        if (idx >= 0) HACKATHONS.splice(idx, 1); saveHackathonsToStorage();
        return null;
      }
    }

    if (sub === "posts") {
      if (method === "GET" && seg.length === 2) {
        let items = POSTS;
        if (params.status) items = items.filter((p) => p.status === params.status);
        return page(items, params.page, params.size);
      }
      if (method === "POST") {
        const newP = {
          id: Date.now(),
          title: (body && body.title) || "New Post",
          body: (body && body.body) || "",
          type: (body && body.type) || "DISCUSSION",
          status: (body && body.status) || "PUBLISHED",
          authorName: "Shivam Yadav",
          authorRole: "ADMIN",
          likeCount: 0,
          commentCount: 0,
          createdAt: new Date().toISOString(),
        };
        POSTS.unshift(newP); savePostsToStorage();
        return newP;
      }
      if (method === "PATCH" && seg.length >= 3) {
        const p = POSTS.find((item) => String(item.id) === String(seg[2]));
        if (p) Object.assign(p, body || {}); savePostsToStorage();
        return p || { id: Number(seg[2]), ...(body || {}) };
      }
      if (method === "DELETE" && seg.length >= 3) {
        const idx = POSTS.findIndex((item) => String(item.id) === String(seg[2]));
        if (idx >= 0) POSTS.splice(idx, 1);
        return null;
      }
    }

    if (sub === "achievements") {
      if (method === "GET" && seg.length === 2) {
        return page(ACHIEVEMENTS, params.page, params.size);
      }
      if (method === "POST") {
        const u = DEMO_ACCOUNTS.find((a) => String(a.id) === String(body.userId)) || DEMO_ACCOUNTS[0];
        const newA = {
          id: Date.now(),
          userId: (body && body.userId) || 1,
          userName: u ? u.name : "Shivam Yadav",
          title: (body && body.title) || "New Achievement",
          type: (body && body.type) || "CERTIFICATE",
          issuer: (body && body.issuer) || "",
          awardDate: (body && body.awardDate) || new Date().toISOString().slice(0, 10),
          description: (body && body.description) || "",
          verifyUrl: (body && body.verifyUrl) || null,
        };
        ACHIEVEMENTS.unshift(newA); saveAchievementsToStorage();
        return newA;
      }
      if (method === "PUT" && seg.length >= 3) {
        const a = ACHIEVEMENTS.find((item) => String(item.id) === String(seg[2]));
        if (a) {
          Object.assign(a, body || {});
          if (body.userId) {
            const u = DEMO_ACCOUNTS.find((usr) => String(usr.id) === String(body.userId));
            if (u) a.userName = u.name;
          }
          return a;
        }
        return { id: Number(seg[2]), ...(body || {}) };
      }
      if (method === "DELETE" && seg.length >= 3) {
        const idx = ACHIEVEMENTS.findIndex((item) => String(item.id) === String(seg[2]));
        if (idx >= 0) ACHIEVEMENTS.splice(idx, 1);
        return null;
      }
    }

    
    if (sub === "events") {
      if (method === "GET") return page(typeof EVENTS !== "undefined" ? EVENTS : [], params.page, params.size);
      if (method === "POST") {
        const newE = { id: Date.now(), title: (body && body.title) || "New Event", status: (body && body.status) || "UPCOMING", date: (body && body.date) || new Date().toISOString(), location: (body && body.location) || "", registerUrl: (body && body.registerUrl) || null, description: (body && body.description) || "" };
        if (typeof EVENTS !== "undefined") EVENTS.unshift(newE);
        if (typeof saveEventsToStorage === "function") saveEventsToStorage();
        return newE;
      }
      if (method === "PUT" && seg.length >= 3) {
        let item = typeof EVENTS !== "undefined" ? EVENTS.find((e) => String(e.id) === String(seg[2])) : null;
        if (item) Object.assign(item, body || {});
        if (typeof saveEventsToStorage === "function") saveEventsToStorage();
        return item || { id: Number(seg[2]), ...(body || {}) };
      }
      if (method === "DELETE" && seg.length >= 3) {
        if (typeof EVENTS !== "undefined") {
          const idx = EVENTS.findIndex((e) => String(e.id) === String(seg[2]));
          if (idx >= 0) EVENTS.splice(idx, 1);
        }
        if (typeof saveEventsToStorage === "function") saveEventsToStorage();
        return null;
      }
    }

    if (sub === "resources") {
      if (method === "GET") return page(typeof RESOURCES !== "undefined" ? RESOURCES : [], params.page, params.size);
      if (method === "POST") {
        const newR = { id: Date.now(), title: (body && body.title) || "New Resource", category: (body && body.category) || "GUIDE", url: (body && body.url) || "", description: (body && body.description) || "" };
        if (typeof RESOURCES !== "undefined") RESOURCES.unshift(newR);
        if (typeof saveResourcesToStorage === "function") saveResourcesToStorage();
        return newR;
      }
      if (method === "PUT" && seg.length >= 3) {
        let item = typeof RESOURCES !== "undefined" ? RESOURCES.find((r) => String(r.id) === String(seg[2])) : null;
        if (item) Object.assign(item, body || {});
        if (typeof saveResourcesToStorage === "function") saveResourcesToStorage();
        return item || { id: Number(seg[2]), ...(body || {}) };
      }
      if (method === "DELETE" && seg.length >= 3) {
        if (typeof RESOURCES !== "undefined") {
          const idx = RESOURCES.findIndex((r) => String(r.id) === String(seg[2]));
          if (idx >= 0) RESOURCES.splice(idx, 1);
        }
        if (typeof saveResourcesToStorage === "function") saveResourcesToStorage();
        return null;
      }
    }

    if (sub === "messages") {
      if (method === "GET") {
        let items = MESSAGES;
        if (params.status) items = items.filter((m) => m.status === params.status);
        return page(items, params.page, params.size);
      }
      if (method === "PATCH" && seg.length >= 3) {
        const m = MESSAGES.find((item) => String(item.id) === String(seg[2]));
        if (m) Object.assign(m, body || {}); saveMessagesToStorage();
        return m || { id: Number(seg[2]), ...(body || {}) };
      }
    }
  }
  if (method !== "GET") {
    return { success: true, message: "Action accepted in demo mode." };
  }
  return err(404, "Not found in the demo dataset");
}

/** True when served without a backend (GitHub Pages, file://, localhost, or ?demo=1). */
export function demoActive() {
  try {
    return window.location.protocol === "file:"
      || window.location.hostname.endsWith("github.io")
      || window.location.hostname === "localhost"
      || window.location.hostname === "127.0.0.1"
      || window.location.hostname === "0.0.0.0"
      || new URLSearchParams(window.location.search).has("demo");
  } catch (e) {
    return false;
  }
}

let EVENTS = [
  { id: 1, title: "Build With 2.0 Hackathon Showcase", date: "2026-09-01T10:00:00", location: "Parul University Auditorium", status: "COMPLETED", registerUrl: "https://example.com/register", description: "Live demonstration of student hackathon MVPs and AI tools." }
];
let RESOURCES = [
  { id: 1, title: "Spring Boot JWT Auth Boilerplate", category: "TEMPLATE", url: "https://github.com/Sky-ydv2008/ai-powered-mini-erp", description: "Production-ready JWT authentication & RBAC implementation for Spring Boot applications." }
];
function saveEventsToStorage() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem("ai_demo_events", JSON.stringify(EVENTS)); } catch (e) {}
}
function saveResourcesToStorage() {
  try { if (typeof localStorage !== "undefined") localStorage.setItem("ai_demo_resources", JSON.stringify(RESOURCES)); } catch (e) {}
}
