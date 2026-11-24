// The learning roadmap shown on the homepage: which track to start with and
// where to go next. Stages run top to bottom. Inside a stage, `order` says
// how its tracks relate:
//   'one'      a single track
//   'sequence' take them in the listed order
//   'any'      take them in any order
// The AI lane sits beside the main path: it can be taken at any point.
// Track titles, times, and lesson counts come from catalog.ts.

export type StageOrder = 'one' | 'sequence' | 'any';

export interface RoadmapStage {
  title: string;
  note: string;
  order: StageOrder;
  slugs: string[];
}

export const ROADMAP: RoadmapStage[] = [
  {
    title: 'Start here',
    note: 'What is inside the machine. Everything else builds on it.',
    order: 'one',
    slugs: ['computing-basics'],
  },
  {
    title: 'Know your operating systems',
    note: 'Take both, in either order. Start with the one you use every day.',
    order: 'any',
    slugs: ['linux-essentials', 'windows-foundations'],
  },
  {
    title: 'Work with code and history',
    note: 'Git on your own machine first, then sharing it with others.',
    order: 'sequence',
    slugs: ['git-fundamentals', 'github-gitlab-fundamentals'],
  },
  {
    title: 'Networks and security',
    note: 'How machines talk, then the language defenders use.',
    order: 'sequence',
    slugs: ['networking-fundamentals', 'security-concepts'],
  },
  {
    title: 'Build on it',
    note: 'The web, scripting, and data. Take them in any order.',
    order: 'any',
    slugs: ['how-the-web-really-works', 'programming-basics-python', 'sql-basics'],
  },
  {
    title: 'Put it all together',
    note: 'Run and harden your own lab server.',
    order: 'one',
    slugs: ['servers-and-services'],
  },
];

export const ANYTIME_LANE: RoadmapStage = {
  title: 'Anytime: AI',
  note: 'No prerequisites. Take it whenever you are curious.',
  order: 'sequence',
  slugs: ['ai-fundamentals', 'how-llms-actually-work'],
};

/** Every track on the roadmap, main path first, then the AI lane. */
export function roadmapSlugs(): string[] {
  return [...ROADMAP.flatMap((stage) => stage.slugs), ...ANYTIME_LANE.slugs];
}

/**
 * One line per track on why it sits where it does in the path. Shown on the
 * Start here page, in roadmap order. Every roadmap track needs one (tested).
 */
export const TRACK_WHY: Record<string, string> = {
  'computing-basics':
    'The map of what is inside the machine. Everything else assumes it.',
  'linux-essentials':
    'Most servers, cloud machines, and security tools run Linux. Start here if you are unsure which OS track to take first.',
  'windows-foundations':
    'Most company laptops run Windows, so most incidents start there. Take it right after Linux, or first if Windows is what you use every day.',
  'git-fundamentals':
    'Rules, configs, and tools live in Git. Its history is evidence.',
  'github-gitlab-fundamentals':
    'Collaboration, review, secrets, and CI: where code meets real permissions.',
  'networking-fundamentals':
    'How machines find and talk to each other: addresses, ports, and packets.',
  'security-concepts':
    'The shared language of the field: CIA, threat versus risk, crypto basics, and the rules of the road.',
  'how-the-web-really-works':
    'What happens between typing a URL and seeing a page, and where it goes wrong.',
  'programming-basics-python':
    'Enough Python to automate a boring check and read other people\'s scripts.',
  'sql-basics':
    'Ask questions of data, the same way you will ask questions of logs.',
  'servers-and-services':
    'Put it all together on a server you build, break, and harden yourself.',
  'ai-fundamentals':
    'What AI and machine learning really are, and where they fail. Take it whenever you like.',
  'how-llms-actually-work':
    'Tokens, embeddings, and the new attacks against AI features. After AI Fundamentals.',
};
