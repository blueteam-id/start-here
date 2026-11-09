export interface CatalogTrack {
  slug: string;
  title: string;
  category: string;
  status: 'live' | 'coming-soon';
  summary: string;
  estimatedMinutes: number;
  lessonCount: number;
  icon: string;
  needsVM?: boolean;
  handsOn?: boolean;
}

// Fixed display order for the catalog. groupByCategory uses this order.
export const CATALOG_CATEGORIES = [
  'Computing Basics',
  'OS & Linux/Windows',
  'Dev Tools & Collaboration',
  'Networking & Web',
  'Programming & Data',
  'Security Foundations',
  'AI Fundamentals',
] as const;

export const CATALOG_TRACKS: CatalogTrack[] = [
  {
    slug: 'computing-basics',
    title: 'How a Computer Actually Works',
    category: 'Computing Basics',
    status: 'live',
    summary:
      'Hardware, storage, data representation, operating systems, virtualization and cloud, at a glance.',
    estimatedMinutes: 120,
    lessonCount: 5,
    icon: '🖥️',
  },
  {
    slug: 'linux-essentials',
    title: 'Linux Essentials',
    category: 'OS & Linux/Windows',
    status: 'live',
    summary: 'Shell navigation, permissions, core commands such as grep and cp, hands-on.',
    estimatedMinutes: 160,
    lessonCount: 7,
    icon: '🐧',
    handsOn: true,
  },
  {
    slug: 'windows-foundations',
    title: 'Windows Foundations',
    category: 'OS & Linux/Windows',
    status: 'live',
    summary:
      'CLI, file system, permissions, Active Directory, PowerShell, Event Viewer, registry basics, hands-on.',
    estimatedMinutes: 175,
    lessonCount: 7,
    icon: '🪟',
    needsVM: true,
    handsOn: true,
  },
  {
    slug: 'git-fundamentals',
    title: 'Git Fundamentals',
    category: 'Dev Tools & Collaboration',
    status: 'coming-soon',
    summary:
      'Commits, branches, merges, and history, how to undo a mistake without losing work.',
    estimatedMinutes: 120,
    lessonCount: 5,
    icon: '🌿',
    handsOn: true,
  },
  {
    slug: 'github-gitlab-fundamentals',
    title: 'GitHub/GitLab Fundamentals',
    category: 'Dev Tools & Collaboration',
    status: 'coming-soon',
    summary:
      'Remotes, pull/merge requests, issues, and CI basics, collaborating on code at scale.',
    estimatedMinutes: 120,
    lessonCount: 5,
    icon: '🐙',
    handsOn: true,
  },
  {
    slug: 'networking-fundamentals',
    title: 'Networking Fundamentals',
    category: 'Networking & Web',
    status: 'coming-soon',
    summary: 'Addressing, ports, TCP/UDP, subnetting, how a packet moves, hands-on.',
    estimatedMinutes: 120,
    lessonCount: 5,
    icon: '🌐',
    handsOn: true,
  },
  {
    slug: 'how-the-web-really-works',
    title: 'How the Web Really Works',
    category: 'Networking & Web',
    status: 'coming-soon',
    summary: 'Search engines, web servers, HTML, cookies.',
    estimatedMinutes: 90,
    lessonCount: 4,
    icon: '🕸️',
  },
  {
    slug: 'servers-and-services',
    title: 'Servers & Services',
    category: 'Networking & Web',
    status: 'coming-soon',
    summary:
      'Web, database, DNS, log and mail servers, basic setup and first hardening steps, hands-on.',
    estimatedMinutes: 180,
    lessonCount: 6,
    icon: '🗄️',
    needsVM: true,
    handsOn: true,
  },
  {
    slug: 'programming-basics-python',
    title: 'Programming Basics (Python)',
    category: 'Programming & Data',
    status: 'coming-soon',
    summary: 'Variables, input, files, and a first TCP socket. Python only.',
    estimatedMinutes: 180,
    lessonCount: 6,
    icon: '🐍',
  },
  {
    slug: 'sql-basics',
    title: 'SQL Basics',
    category: 'Programming & Data',
    status: 'coming-soon',
    summary: 'Statements, joins, basic database administration.',
    estimatedMinutes: 120,
    lessonCount: 5,
    icon: '🗃️',
  },
  {
    slug: 'security-concepts',
    title: 'Security Concepts',
    category: 'Security Foundations',
    status: 'coming-soon',
    summary:
      'CIA triad, threat vs. vulnerability vs. risk, crypto basics, ethics and legal boundaries, a first taste of recon and forensics.',
    estimatedMinutes: 120,
    lessonCount: 5,
    icon: '🛡️',
  },
  {
    slug: 'ai-fundamentals',
    title: 'AI Fundamentals',
    category: 'AI Fundamentals',
    status: 'coming-soon',
    summary: 'What AI and machine learning actually are, key terms, capabilities and limits.',
    estimatedMinutes: 120,
    lessonCount: 5,
    icon: '🤖',
  },
  {
    slug: 'how-llms-actually-work',
    title: 'How LLMs Actually Work',
    category: 'AI Fundamentals',
    status: 'coming-soon',
    summary:
      'Tokens, embeddings, and transformers, plus the security angle: prompt injection, jailbreaks, and data leakage.',
    estimatedMinutes: 120,
    lessonCount: 5,
    icon: '🧠',
  },
];

export function groupByCategory(
  tracks: CatalogTrack[],
): Array<{ category: string; tracks: CatalogTrack[] }> {
  return CATALOG_CATEGORIES.map((category) => ({
    category,
    tracks: tracks.filter((t) => t.category === category),
  })).filter((group) => group.tracks.length > 0);
}
