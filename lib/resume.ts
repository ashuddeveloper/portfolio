/**
 * Single source of truth for every piece of content on the site.
 * All data below is transcribed from Ashutosh_Gupta_Resume.pdf — nothing is invented.
 */

export const person = {
  name: "Ashutosh Gupta",
  firstName: "Ashutosh",
  lastName: "Gupta",
  title: "Senior Software Engineer",
  tagline: "Backend (Python) & AI Platforms",
  location: "Noida, India",
  email: "ashuddeveloper@gmail.com",
  summary:
    "Software engineer with 6 years of experience building scalable, cloud-native backend systems and REST APIs in Python (FastAPI, Django, Flask). Designing distributed services and AI/agentic platforms at enterprise scale on Google Cloud. Strong in system design, LLD, and data structures & algorithms, with end-to-end ownership from architecture to production.",
  intro:
    "Six years of building scalable, cloud-native backend systems and REST APIs in Python — now designing distributed services and agentic-AI platforms at enterprise scale on Google Cloud.",
  links: {
    github: "https://github.com/ashuddeveloper",
    linkedin: "https://linkedin.com/in/ashutosh-gupta7",
    codechef: "https://www.codechef.com/users/ashuddeveloper",
  },
  handles: {
    github: "ashuddeveloper",
    linkedin: "ashutosh-gupta7",
    codechef: "ashuddeveloper",
  },
  resumeFile: "/resume/Ashutosh_Gupta_Resume.pdf",
} as const;

/** Rotating lines under the hero title — each one is lifted from the resume summary. */
export const rotatingRoles = [
  "cloud-native backend systems",
  "AI & agentic platforms",
  "distributed services on Google Cloud",
  "REST APIs at enterprise scale",
] as const;

export interface Stat {
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
}

export const stats: Stat[] = [
  { value: 6, suffix: "+", label: "years building backends" },
  { value: 1000, suffix: "+", label: "enterprise customers served" },
  { value: 99.9, suffix: "%", decimals: 1, label: "uptime sustained on Cloud Run" },
  { value: 12, suffix: "+", label: "live game titles shipped" },
];

export interface Metric {
  value: string;
  label: string;
}

export interface ExperienceRole {
  id: string;
  company: string;
  companyFull?: string;
  role: string;
  location: string;
  period: string;
  start: string;
  end: string;
  current?: boolean;
  summary: string;
  bullets: string[];
  metrics: Metric[];
  tech: string[];
  clients?: string[];
}

export const experience: ExperienceRole[] = [
  {
    id: "ukg",
    company: "UKG",
    companyFull: "Ultimate Kronos Group",
    role: "Senior Software Engineer (Python Developer)",
    location: "Noida, India",
    period: "Oct 2024 — Present",
    start: "2024-10",
    end: "present",
    current: true,
    summary:
      "Architecting the backend services and agentic-AI platform behind UKG's enterprise workforce-management products.",
    bullets: [
      "Architected and shipped scalable, cloud-native backend services and REST APIs in Python/FastAPI that power UKG's enterprise workforce-management and Generative-AI platforms serving 1,000+ enterprise customers.",
      "Led migration of core services from Scala to Python/FastAPI, cutting feature-delivery time by ~30% and reducing maintenance overhead while modernizing the legacy stack.",
      "Designed and built an enterprise AI extensibility platform (Agents, Skills, Scripts, Commands, Hooks) with workflow authoring, validation, and automated testing — reducing workflow creation time by ~60%.",
      "Owned Low-Level Design (LLD) and modular, service-oriented architecture for new AI-platform capabilities, enabling delivery of 5+ new capabilities per quarter.",
      "Deployed containerized services on Google Cloud Run with secure secret management via Google Secret Manager, sustaining 99.9% uptime with zero credential-exposure incidents.",
    ],
    metrics: [
      { value: "1,000+", label: "enterprise customers" },
      { value: "~30%", label: "faster feature delivery" },
      { value: "~60%", label: "less workflow authoring time" },
      { value: "99.9%", label: "uptime, zero credential leaks" },
    ],
    tech: [
      "Python",
      "Scala",
      "FastAPI",
      "REST APIs",
      "PostgreSQL",
      "Docker",
      "Linux",
      "Google Cloud Run",
      "Google Secret Manager",
      "ORM",
      "Git",
    ],
  },
  {
    id: "ingenuity",
    company: "Ingenuity Gaming",
    companyFull: "Ingenuity Gaming Pvt. Ltd.",
    role: "Software Engineer — Game Engines (Python Developer)",
    location: "Noida, India",
    period: "Nov 2022 — Sep 2024",
    start: "2022-11",
    end: "2024-09",
    summary:
      "Built high-performance slot-game engines in Python from client math specifications for global gaming studios.",
    bullets: [
      "Built high-performance slot-game engines in Python from client math specifications, implementing complex probability models and configurable user-preference logic across 12+ live titles for clients including Light & Wonder, AvatarUX, Rogue, and Reel Play.",
      "Developed data-mining pipelines with Pandas to identify gameplay patterns and correlations, informing engine tuning that improved game performance by ~25%.",
      "Hardened reliability through unit and volume testing simulating 10M+ spins, catching critical defects before release.",
      "Improved code quality with SonarQube (reduced code smells by ~40%) and deployed containerized engines on AWS/GCP for scalable load testing.",
    ],
    metrics: [
      { value: "12+", label: "live titles shipped" },
      { value: "10M+", label: "spins simulated in testing" },
      { value: "~25%", label: "game performance gained" },
      { value: "~40%", label: "code smells removed" },
    ],
    tech: [
      "Python",
      "REST APIs",
      "Pandas",
      "Docker",
      "Linux",
      "AWS",
      "Azure",
      "PostgreSQL",
      "SonarQube",
    ],
    clients: ["Light & Wonder", "AvatarUX", "Rogue", "Reel Play"],
  },
  {
    id: "ezops",
    company: "EZOPS Inc",
    role: "Python Developer (Implementation Analyst)",
    location: "Noida, India",
    period: "Sep 2020 — Sep 2022",
    start: "2020-09",
    end: "2022-09",
    summary:
      "Automated financial data reconciliation and ETL for major banking clients; promoted from Associate Intern within 6 months.",
    bullets: [
      "Built and maintained automated data-reconciliation tools and ETL pipelines (Python, Pandas, REST/SOAP APIs, Selenium) processing financial data for clients including Wells Fargo, BNY Mellon, and SEI.",
      "Developed ARO Pypeline, a no-code data-transformation tool enabling non-technical users to clean, join, pivot, and transform data — cutting manual reporting effort by ~15 hours/week.",
      "Applied machine-learning algorithms to auto-match reconciliation breaks, improving match accuracy by ~30% and reducing manual review.",
      "Automated data extraction from Oracle and MS SQL (cx_Oracle, Pyodbc) and browser workflows via Selenium, eliminating ~20 hours of manual work per cycle. Promoted from Associate Intern within 6 months.",
    ],
    metrics: [
      { value: "~15 h/wk", label: "manual reporting removed" },
      { value: "~30%", label: "better match accuracy" },
      { value: "~20 h", label: "saved per extraction cycle" },
      { value: "6 mo", label: "intern to full-time promotion" },
    ],
    tech: [
      "Python",
      "Pandas",
      "REST/SOAP APIs",
      "Pyodbc",
      "cx_Oracle",
      "Selenium",
      "Docker",
      "Linux",
      "AWS",
      "Azure",
      "MS SQL",
      "Oracle DB",
    ],
    clients: ["Wells Fargo", "BNY Mellon", "SEI"],
  },
];

export type ProjectCategory = "ai-platform" | "backend" | "data";

export const projectCategories: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai-platform", label: "AI Platforms" },
  { id: "backend", label: "Backend Systems" },
  { id: "data", label: "Data Engineering" },
];

export interface Project {
  id: string;
  name: string;
  route: string;
  tagline: string;
  context: string;
  category: ProjectCategory;
  description: string;
  challenge: string;
  solution: string;
  features: string[];
  outcomes: string[];
  tech: string[];
  status: string;
  /** hue used to tint the generative cover art */
  accent: "ion" | "violet" | "gold" | "cyan";
}

export const projects: Project[] = [
  {
    id: "extensibility-studio",
    name: "Extensibility Studio",
    route: "/projects/extensibility-studio",
    tagline: "Enterprise workflow authoring for agentic AI",
    context: "UKG · AI Platforms",
    category: "ai-platform",
    description:
      "Enterprise workflow-authoring platform supporting Agents, Skills, Scripts, Commands, and Hooks, with built-in validation, testing, and deployment pipelines to Google Cloud Run.",
    challenge:
      "Authoring enterprise AI workflows was slow and manual — every agent, skill, script, command, and hook needed hand-built validation, testing, and deployment.",
    solution:
      "A platform where Agents, Skills, Scripts, Commands, and Hooks are first-class authorable objects, with validation, automated testing, and deployment pipelines to Google Cloud Run built in.",
    features: [
      "Authoring for Agents, Skills, Scripts, Commands & Hooks",
      "Built-in workflow validation",
      "Automated testing pipeline",
      "One-path deployment to Google Cloud Run",
    ],
    outcomes: [
      "~60% reduction in workflow creation time",
      "Secure secret management via Google Secret Manager",
      "Ships to production on Google Cloud Run",
    ],
    tech: ["Python", "LLM / Agentic AI", "Google Cloud Run", "Google Secret Manager"],
    status: "Enterprise · Proprietary",
    accent: "gold",
  },
  {
    id: "bryte",
    name: "Bryte Generative-AI Platform",
    route: "/projects/bryte",
    tagline: "Activation & control panel for UKG's generative AI",
    context: "UKG · AI Platforms",
    category: "ai-platform",
    description:
      "Backend services and APIs for feature activation and centralized administration of UKG's Generative-AI capabilities, with modular architecture supporting configurable AI functionality.",
    challenge:
      "UKG's growing set of Generative-AI capabilities needed one place for feature activation and centralized administration across the product suite.",
    solution:
      "Backend services and REST APIs forming an activation and control panel, built on a modular architecture that keeps every AI capability configurable.",
    features: [
      "Feature activation APIs",
      "Centralized administration",
      "Modular, configuration-driven architecture",
      "REST APIs in Python/FastAPI",
    ],
    outcomes: [
      "Central control panel for Generative-AI capabilities",
      "Configurable AI functionality per customer",
      "Powers platforms serving 1,000+ enterprise customers",
    ],
    tech: ["Python", "FastAPI", "MySQL", "REST APIs"],
    status: "Enterprise · Proprietary",
    accent: "violet",
  },
  {
    id: "dsaas",
    name: "Data Science as a Service",
    route: "/projects/dsaas",
    tagline: "Workforce analytics backend, migrated Scala → Python",
    context: "UKG · Backend",
    category: "backend",
    description:
      "Migrated the enterprise Auditor backend from Scala to Python; designed the LLD and built REST APIs for workforce analytics using async ORM patterns.",
    challenge:
      "A legacy Scala Auditor backend slowed feature delivery and carried heavy maintenance overhead.",
    solution:
      "Owned the Low-Level Design and rebuilt the service in Python/FastAPI with async ORM patterns (Tortoise ORM), exposing clean REST APIs for workforce analytics.",
    features: [
      "Full Scala → Python migration",
      "Low-Level Design ownership",
      "Async ORM patterns with Tortoise ORM",
      "REST APIs for workforce analytics",
    ],
    outcomes: [
      "~30% faster feature delivery",
      "Reduced maintenance overhead",
      "Modernized legacy stack",
    ],
    tech: ["Python", "Scala", "FastAPI", "Docker", "Tortoise ORM"],
    status: "Enterprise · Proprietary",
    accent: "ion",
  },
  {
    id: "aro-pypeline",
    name: "ARO Pypeline",
    route: "/projects/aro-pypeline",
    tagline: "No-code data transformation for financial operations",
    context: "EZOPS · FinTech",
    category: "data",
    description:
      "A no-code data-transformation tool enabling non-technical users to clean, join, pivot, and transform data — cutting manual reporting effort by ~15 hours/week.",
    challenge:
      "Non-technical analysts depended on engineers for every clean-up, join, pivot, and transform in reconciliation reporting.",
    solution:
      "A no-code tool where analysts compose cleaning, joining, pivoting, and transformation steps themselves — no engineer in the loop.",
    features: [
      "No-code transformation builder",
      "Clean, join, pivot & transform operations",
      "Built for non-technical users",
      "Plugs into reconciliation ETL pipelines",
    ],
    outcomes: [
      "~15 hours of manual reporting removed per week",
      "Analysts self-serve end-to-end",
      "Built for reconciliation workflows serving major financial clients",
    ],
    tech: ["Python", "Pandas", "REST/SOAP APIs"],
    status: "Enterprise · Proprietary",
    accent: "cyan",
  },
];

export type SkillCategoryId =
  "languages" | "backend" | "cloud" | "databases" | "ai" | "fundamentals" | "tools";

export interface SkillCategory {
  id: SkillCategoryId;
  label: string;
  /** hex color used in the 3D constellation + chips (dark theme) */
  color: string;
  /** darker variant that keeps contrast on light backgrounds */
  colorLight: string;
}

export const skillCategories: SkillCategory[] = [
  { id: "languages", label: "Languages", color: "#62a4ff", colorLight: "#2557c9" },
  { id: "backend", label: "Backend & Frameworks", color: "#8f7bff", colorLight: "#5b46cf" },
  { id: "cloud", label: "Cloud & DevOps", color: "#55d6f5", colorLight: "#0d7ea1" },
  { id: "databases", label: "Databases", color: "#e9b860", colorLight: "#8f6415" },
  { id: "ai", label: "AI / Data", color: "#f983c4", colorLight: "#b0347c" },
  { id: "fundamentals", label: "CS Fundamentals", color: "#7ee2a8", colorLight: "#1d7a4b" },
  { id: "tools", label: "Tools", color: "#a8b3d6", colorLight: "#4c5878" },
];

export interface Skill {
  name: string;
  category: SkillCategoryId;
  /** 1–3, drives node size in the constellation (3 = used across most roles) */
  weight: 1 | 2 | 3;
  /** where the resume shows this skill in action */
  usedAt: string[];
}

export const skills: Skill[] = [
  // Languages
  {
    name: "Python",
    category: "languages",
    weight: 3,
    usedAt: ["UKG", "Ingenuity Gaming", "EZOPS", "All key projects"],
  },
  {
    name: "SQL",
    category: "languages",
    weight: 2,
    usedAt: ["UKG", "Ingenuity Gaming", "EZOPS"],
  },
  {
    name: "JavaScript (ReactJS)",
    category: "languages",
    weight: 1,
    usedAt: ["Technical skill set"],
  },
  // Backend & Frameworks
  { name: "FastAPI", category: "backend", weight: 3, usedAt: ["UKG", "Bryte", "DSAAS"] },
  { name: "Django", category: "backend", weight: 2, usedAt: ["Backend toolkit"] },
  { name: "Flask", category: "backend", weight: 2, usedAt: ["Backend toolkit"] },
  {
    name: "REST APIs",
    category: "backend",
    weight: 3,
    usedAt: ["UKG", "Ingenuity Gaming", "EZOPS"],
  },
  { name: "Tortoise ORM", category: "backend", weight: 2, usedAt: ["DSAAS"] },
  { name: "SQLAlchemy", category: "backend", weight: 2, usedAt: ["Backend toolkit"] },
  // Cloud & DevOps
  {
    name: "Google Cloud Run",
    category: "cloud",
    weight: 3,
    usedAt: ["UKG", "Extensibility Studio"],
  },
  { name: "GCP", category: "cloud", weight: 3, usedAt: ["UKG", "Ingenuity Gaming"] },
  { name: "AWS", category: "cloud", weight: 2, usedAt: ["Ingenuity Gaming", "EZOPS"] },
  { name: "Azure", category: "cloud", weight: 2, usedAt: ["Ingenuity Gaming", "EZOPS"] },
  {
    name: "Docker",
    category: "cloud",
    weight: 3,
    usedAt: ["UKG", "Ingenuity Gaming", "EZOPS"],
  },
  { name: "Linux", category: "cloud", weight: 3, usedAt: ["UKG", "Ingenuity Gaming", "EZOPS"] },
  {
    name: "Google Secret Manager",
    category: "cloud",
    weight: 2,
    usedAt: ["UKG", "Extensibility Studio"],
  },
  // Databases
  { name: "PostgreSQL", category: "databases", weight: 3, usedAt: ["UKG", "Ingenuity Gaming"] },
  { name: "MySQL", category: "databases", weight: 2, usedAt: ["Bryte"] },
  { name: "MS SQL", category: "databases", weight: 2, usedAt: ["EZOPS"] },
  { name: "Oracle", category: "databases", weight: 2, usedAt: ["EZOPS"] },
  { name: "MongoDB", category: "databases", weight: 1, usedAt: ["Database toolkit"] },
  // AI / Data
  { name: "Generative AI", category: "ai", weight: 3, usedAt: ["UKG", "Bryte"] },
  {
    name: "Agentic AI / LLM agents",
    category: "ai",
    weight: 3,
    usedAt: ["UKG", "Extensibility Studio"],
  },
  {
    name: "Pandas",
    category: "ai",
    weight: 3,
    usedAt: ["Ingenuity Gaming", "EZOPS", "ARO Pypeline"],
  },
  // CS Fundamentals
  {
    name: "Data Structures & Algorithms",
    category: "fundamentals",
    weight: 3,
    usedAt: ["CodeChef 1758", "Monthly DSA classes"],
  },
  {
    name: "System Design",
    category: "fundamentals",
    weight: 3,
    usedAt: ["UKG", "Platform architecture"],
  },
  {
    name: "Low-Level Design (LLD)",
    category: "fundamentals",
    weight: 3,
    usedAt: ["UKG", "DSAAS"],
  },
  {
    name: "Distributed Systems",
    category: "fundamentals",
    weight: 3,
    usedAt: ["UKG", "Google Cloud services"],
  },
  // Tools
  { name: "Git", category: "tools", weight: 3, usedAt: ["UKG", "Ingenuity Gaming", "EZOPS"] },
  { name: "Bitbucket", category: "tools", weight: 1, usedAt: ["Tooling"] },
  { name: "GitLab", category: "tools", weight: 1, usedAt: ["Tooling"] },
  { name: "Jira", category: "tools", weight: 2, usedAt: ["Delivery workflow"] },
  { name: "SonarQube", category: "tools", weight: 2, usedAt: ["Ingenuity Gaming"] },
  { name: "Selenium", category: "tools", weight: 2, usedAt: ["EZOPS"] },
];

export interface Education {
  id: string;
  degree: string;
  short: string;
  institute: string;
  place: string;
  period: string;
  score: string;
}

export const education: Education[] = [
  {
    id: "mca",
    degree: "Master of Computer Applications",
    short: "MCA",
    institute: "Institute of Engineering and Technology (IET)",
    place: "Lucknow",
    period: "Aug 2018 — Jul 2021",
    score: "79.9%",
  },
  {
    id: "bca",
    degree: "Bachelor of Computer Applications",
    short: "BCA",
    institute: "Dr. Virendra Swarup Institute of Computer Studies",
    place: "Kanpur",
    period: "Aug 2015 — Jul 2018",
    score: "62.31%",
  },
];

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  detail: string;
  kind: "certification" | "honor";
}

export const credentials: Credential[] = [
  {
    id: "mta",
    title: "Microsoft Technology Associate",
    issuer: "Microsoft",
    detail: "Database Fundamentals",
    kind: "certification",
  },
  {
    id: "codechef",
    title: "CodeChef — highest rating 1758",
    issuer: "CodeChef · @ashuddeveloper",
    detail: "Active competitive programmer",
    kind: "honor",
  },
];

export interface CommunityItem {
  title: string;
  detail: string;
}

export const community: CommunityItem[] = [
  {
    title: "Monthly DSA classes",
    detail: "Conducts monthly data-structures & problem-solving classes for junior students.",
  },
  {
    title: "Academic Head — Parmarth Social Club",
    detail: "Led the academic wing of the social club.",
  },
  {
    title: "Volunteer — Josh Talks",
    detail: "Community volunteer.",
  },
];

export interface AboutAct {
  id: string;
  index: string;
  years: string;
  title: string;
  place: string;
  body: string;
}

export const aboutActs: AboutAct[] = [
  {
    id: "data",
    index: "Act I",
    years: "2020 — 2022",
    title: "Data",
    place: "EZOPS · FinTech",
    body: "Started where correctness is non-negotiable: reconciling financial data for Wells Fargo, BNY Mellon, and SEI. Built ETL pipelines, automated away ~20 hours of manual work per cycle, shipped a no-code transformation tool — and was promoted from Associate Intern within six months.",
  },
  {
    id: "engines",
    index: "Act II",
    years: "2022 — 2024",
    title: "Engines",
    place: "Ingenuity Gaming · Game Engines",
    body: "Turned client math specifications into high-performance slot-game engines — complex probability models across 12+ live titles. Reliability meant simulating 10M+ spins before release; craft meant cutting code smells by ~40% with SonarQube.",
  },
  {
    id: "platforms",
    index: "Act III",
    years: "2024 — now",
    title: "Platforms",
    place: "UKG · AI Platforms",
    body: "Now architecting agentic-AI infrastructure at enterprise scale: an extensibility platform of Agents, Skills, Scripts, Commands, and Hooks, a Scala-to-Python migration that cut delivery time ~30%, and services on Google Cloud Run holding 99.9% uptime for 1,000+ customers.",
  },
];

export interface Philosophy {
  title: string;
  body: string;
}

export const philosophy: Philosophy[] = [
  {
    title: "Own it end-to-end",
    body: "From architecture and low-level design to production and uptime — a service isn't done until it runs reliably for the people using it.",
  },
  {
    title: "Quality is a habit",
    body: "Ten million simulated spins before a release. SonarQube on every engine. Zero credential-exposure incidents. Reliability is built in, not bolted on.",
  },
  {
    title: "Teach what you learn",
    body: "Monthly DSA and problem-solving classes for junior students — because explaining a thing is the fastest way to truly understand it.",
  },
];

export const strengths = [
  "System Design",
  "Low-Level Design (LLD)",
  "Data Structures & Algorithms",
  "Distributed Systems",
] as const;

export const interests = [
  "Generative & Agentic AI",
  "LLM agent frameworks",
  "Distributed systems",
  "Competitive programming",
] as const;

/** Section registry: ids, nav labels and the HTTP-route eyebrows that structure the page. */
export interface Section {
  id: string;
  label: string;
  route: string;
  method: "GET" | "POST";
}

export const sections: Section[] = [
  { id: "home", label: "Home", route: "/", method: "GET" },
  { id: "about", label: "About", route: "/about", method: "GET" },
  { id: "experience", label: "Experience", route: "/experience", method: "GET" },
  { id: "projects", label: "Projects", route: "/projects", method: "GET" },
  { id: "skills", label: "Skills", route: "/skills", method: "GET" },
  { id: "education", label: "Education", route: "/education", method: "GET" },
  { id: "contact", label: "Contact", route: "/contact", method: "POST" },
];
