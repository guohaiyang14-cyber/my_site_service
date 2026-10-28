// ⚠️ 内存数组：进程重启就清空。第 2 周接 SQLite 时整体替换。
const projects = [
  {
    id: 1,
    slug: 'portfolio-v2',
    title: '个人作品集 v2',
    summary: '基于 Next.js + Tailwind 的响应式作品集，支持暗色模式。',
    techStack: ['Next.js', 'Tailwind', 'TypeScript'],
    repoUrl: 'https://github.com/you/portfolio-v2',
    demoUrl: 'https://your.site',
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    slug: 'api-playground',
    title: 'API Playground',
    summary: '一个用来练手 Express 的轻量 API，带内存 CRUD。',
    techStack: ['Node.js', 'Express'],
    repoUrl: null,
    demoUrl: null,
    featured: false,
    createdAt: new Date().toISOString(),
  },
];
let nextId = projects.length + 1;

function findAll({ featured } = {}) {
  return featured === undefined
    ? projects
    : projects.filter((p) => p.featured === featured);
}

function findBySlug(slug) {
  return projects.find((p) => p.slug === slug);
}

function insert(data) {
  const project = { id: nextId++, ...data, createdAt: new Date().toISOString() };
  projects.push(project);
  return project;
}

module.exports = { findAll, findBySlug, insert };