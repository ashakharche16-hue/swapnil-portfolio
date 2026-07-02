import type { SiteContent } from "@/types/content";

/**
 * Source of truth for all public-site copy (Slice 1).
 * Ported from `reference/index.html`. In Slice 2 this seeds the database and
 * the site switches to reading from Supabase instead of this file.
 *
 * Inline emphasis markers (see types/content.ts and components/ui/RichText.tsx):
 *   **bold**  __accent__  `mono`
 */
export const seed: SiteContent = {
  identity: {
    name: "Swapnil Kharche",
    initials: "SK",
    availabilityLabel: "available",
    // Owner: drop the PDF at /public/Swapnil_Kharche_Resume.pdf to enable this.
    resumeUrl: "/Swapnil_Kharche_Resume.pdf",
    email: "swapnil.d.kharche@gmail.com",
    phone: "+91-9699668592",
    linkedinUrl: "https://www.linkedin.com/in/swapnildkharche/",
    linkedinHandle: "/in/swapnildkharche",
    location: "Pune, India",
  },

  nav: [
    { label: "home", href: "#top" },
    { label: "work", href: "#work" },
    { label: "experience", href: "#experience" },
    { label: "skills", href: "#skills" },
    { label: "ai", href: "#ai" },
    { label: "rag demo", href: "/rag" },
    { label: "contact", href: "#contact" },
  ],

  hero: {
    eyebrow: ["SWAPNIL KHARCHE", "PUNE · IN", "OPEN TO WORK"],
    name: [{ text: "Hey, I'm Swapnil," }],
    rotatingRoles: [
      "Problem Solver!",
      "Tech Enthusiast!",
      "Engineering Leader!",
      "Systems Builder!",
      "Cloud Migration Specialist!",
    ],
    role: "Software Development Manager and Technical Lead with __12+ years__ modernizing mission-critical platforms across Government, Healthcare, E-commerce, and Financial domains.",
    sub: "I lead multi-stream teams that ship secure, scalable systems consolidating legacy estates, building integration backbones, and embedding AI-driven engineering into delivery workflows. Currently at Deloitte Consulting.",
    chips: [
      { icon: "pin", label: "Pune, India" },
      { icon: "calendar", label: "12+ years in industry" },
      { icon: "building", label: "Deloitte Consulting LLP" },
      { icon: "graduation-cap", label: "M.S. CS · Florida State University" },
      { icon: "check-circle", label: "Open to senior roles" },
    ],
    ctas: [
      {
        label: "Download Resume",
        href: "/Swapnil_Kharche_Resume.pdf",
        primary: true,
        download: true,
        icon: "download",
      },
      { label: "View Selected Work", href: "#work" },
      { label: "Get in Touch", href: "#contact" },
    ],
  },

  metrics: [
    { value: "12", unit: "+", label: "Years engineering & leadership" },
    {
      value: "5K",
      unit: "+",
      label: "Users on modernized government platform",
    },
    { value: "52", label: "Partner interfaces unified in one hub" },
    {
      value: "300",
      unit: "+",
      label: "Screens secured with audit & access governance",
    },
  ],

  about: {
    heading: { num: "01", title: "About", meta: "/ engineering philosophy" },
    paragraphs: [
      "I translate **complex domain and architectural challenges** into secure, scalable platforms that reduce risk, optimize cost, and accelerate time-to-value. The work I'm proudest of is rarely the new, greenfield kind — it's the careful modernization of systems people already depend on, done without breaking their day.",
      "For 12+ years I've led delivery on platforms that touch real users at scale: a government modernization program serving 5,000+ users and millions of transactions; an integration backbone wiring 52 partner systems; AI-driven internal tooling that reclaims engineering hours every week. My teams ship with quality because the practices — CI/CD discipline, structured documentation, audit-grade traceability — are non-negotiable, not afterthoughts.",
    ],
  },

  experience: {
    heading: {
      num: "02",
      title: "Experience",
      meta: "/ 2014 — present",
      lead: "A decade of delivery work across **government modernization, distributed systems, cloud-native engineering, and AI-driven tooling** — with the leadership accountability to back it.",
    },
    items: [
      {
        role: "Software Development Manager",
        company: "Deloitte Consulting LLP · USA",
        period: "Jul 2016 — Present",
        heading:
          "Leading multi-stream modernization of mission-critical government platforms.",
        summary:
          "Direct accountability across engineering, architecture, AI integration, cloud, DevOps, and delivery process for a long-running government modernization program. Played a key role in securing a 14-year enterprise contract through architectural POCs delivered in client presentations.",
        groups: [
          {
            label: "Engineering Leadership & People",
            bullets: [
              "Led and mentored **4 cross-functional teams** (`15+` engineers, QA, designers) driving high delivery velocity while preserving quality and stakeholder confidence.",
              "Established Jira UAT training and developer enablement initiatives — **onboarding time down 30%**, cross-team productivity up `15%`, solution quality standards elevated across teams.",
              "Directed stakeholder discussions, defect triage, and UAT governance — accelerating testing cycles and improving execution efficiency.",
            ],
          },
          {
            label: "Architecture & System Design",
            bullets: [
              "Architected a **360° Unified Portal** consolidating data from `40+` legacy screens — case access time down `70%`.",
              "Designed a centralized **Interface Hub** integrating `52` partner interfaces as the unified inbound/outbound integration layer.",
              "Built audit trail and access governance components across `300+` screens — ensuring regulatory compliance, RBAC, and full traceability on a mission-critical platform.",
            ],
          },
          {
            label: "Backend & Distributed Systems",
            bullets: [
              "Delivered REST APIs that cut data transfer latency by `40%` and streamlined interdepartmental workflows.",
              "Containerized Java applications with Docker; environment-related defects down `30%`.",
              "Designed and published a **GraphQL API POC** on AWS, influencing firm-wide adoption of modern API architectures.",
              "Enforced quality via JUnit-based TDD, Log4j structured logging, and JMeter performance validation.",
            ],
          },
          {
            label: "Cloud & Cloud-Native Engineering",
            bullets: [
              "Deployed cloud-native services on AWS EC2 leveraging S3, IAM, SES, CloudWatch — improved scalability and operational monitoring.",
              "Containerized DB2 and SQL Server with Docker — accelerating environment setup and improving consistency across teams.",
              "Eliminated **6–12 hours of manual documentation per screen** with an AI pipeline auto-generating Excel storyboards from Figma and legacy UI metadata — `40–70×` productivity gain.",
            ],
          },
          {
            label: "DevOps, CI/CD & Automation",
            bullets: [
              "Automated `10+` complex batch processes — manual effort down **95%**, saving 3 days per execution cycle.",
              "Owned, maintained, and scaled CI/CD on Jenkins and AWS CodePipeline across multiple projects — eliminating the need for a dedicated DevOps engineer.",
              "Automated database backup & archival workflows — storage and operational costs down `75%`.",
            ],
          },
          {
            label: "Scale, Data & Performance",
            bullets: [
              "Modernized a government platform serving `5,000+` users and millions of transactions — with full legacy parity and business continuity.",
              "Ensured **100% availability** of mission-critical batch jobs through proactive monitoring and issue resolution.",
              "Built a checksum-based reconciliation tool validating DB2→Oracle migration across `300+` tables and millions of records — manual verification effort down `90%`.",
              "Migrated DB2 schemas, data, and queries to SQL Server using SSMA, fully automated, ensuring integrity end-to-end.",
            ],
          },
        ],
      },
      {
        role: "Research Assistant",
        company: "Florida State University · Dept. of Economics",
        period: "Oct 2014 — May 2016",
        heading:
          "Built a large-scale search engine over 100M+ scraped records.",
        summary:
          "Scraped and processed **100+ million** web records in Python; built a standalone search engine that cut data access time by **96%** and enabled faster research insights for the department.",
        groups: [
          {
            label: "Open-source contribution · jEdit",
            bullets: [
              "Implemented word-wrap functionality in Java to improve text editor usability.",
              "Enhanced hyper-search results by highlighting lines by type — improving developer productivity.",
              "Added a bug submission feature, streamlining issue reporting within the platform.",
            ],
          },
        ],
      },
    ],
  },

  work: {
    heading: {
      num: "03",
      title: "Selected work",
      meta: "/ shipped & in production",
      lead: "A handful of recent projects that show **how I think about scale, integration, and the responsible introduction of AI** into engineering workflows. Built across the Deloitte modernization program.",
    },
    cases: [
      {
        index: "01 / Architecture",
        tag: "Government",
        title:
          "360° Unified Portal — one screen for case workers, forty behind it.",
        description:
          "Consolidated case-worker data scattered across **40+ legacy screens** into a single unified portal. Designed the data aggregation layer, the security model, and the navigation paradigm so that case workers stopped tab-hopping and started doing the work.",
        stack: ["Java", "Spring Boot", "REST", "SQL Server", "AWS"],
        impact: [
          { num: "70%", label: "faster case access" },
          { num: "40+", label: "screens consolidated" },
        ],
      },
      {
        index: "02 / Integration",
        tag: "Platform",
        title:
          "Interface Hub — fifty-two partner systems, one integration layer.",
        description:
          "Designed and shipped a centralized integration platform that absorbed all inbound and outbound enterprise data flows. Replaced point-to-point sprawl with a contract-first hub: easier to monitor, easier to govern, easier to extend.",
        stack: ["Java", "Microservices", "REST", "Kafka", "Swagger"],
        impact: [
          { num: "52", label: "interfaces integrated" },
          { num: "1", label: "platform to govern them" },
        ],
      },
      {
        index: "03 / AI & Engineering",
        tag: "Internal Tool",
        title: "RAG Documentation Assistant — semantic recall over OCR'd PDFs.",
        description:
          "Built an internal documentation assistant using Flask and ChromaDB with semantic retrieval over OCR-processed PDFs. Made the team's institutional knowledge actually queryable — the kind of fix that compounds quietly across a quarter.",
        stack: ["Python", "Flask", "ChromaDB", "RAG", "OCR"],
        impact: [
          { num: "75%+", label: "time-to-info reduction" },
          { num: "2–3h", label: "reclaimed / dev / week" },
        ],
      },
      {
        index: "04 / AI Operations",
        tag: "Production",
        title:
          "Ticket Intelligence System — human-in-the-loop triage for 3K+ tickets/mo.",
        description:
          "An AI-driven classification and routing system for support tickets, built on OpenAI, AWS Lambda, and n8n with a human-in-the-loop checkpoint. Routes **3,000+ tickets a month** — routing time collapsed from hours to minutes.",
        stack: ["OpenAI", "AWS Lambda", "n8n", "Python"],
        impact: [
          { num: "91%", label: "routing accuracy" },
          { num: "3K+", label: "tickets / month" },
        ],
      },
    ],
  },

  ai: {
    heading: {
      num: "04",
      title: "AI Engineering",
      meta: "/ pragmatic, in production",
      lead: "I treat AI as **another tool in the engineering stack** — useful when the problem fits, measured by the hours and dollars it reclaims, and instrumented like any other production system. Below are three patterns I've shipped.",
    },
    patterns: [
      {
        num: "PROJECT 01",
        title: "Live RAG demo — ask questions of any PDF, on this site.",
        description:
          "A working Retrieval-Augmented Generation app right here: upload a PDF and get answers grounded in its contents, with citations and follow-up memory. Local parsing, embeddings, and reranking; streamed answers. Click to try it.",
        stack: ["Next.js", "pgvector", "Transformers.js", "Groq", "OCR"],
        href: "/rag",
      },
      {
        num: "PROJECT 02",
        title: "Human-in-the-loop classification at production scale.",
        description:
          "LLM-based triage with a confidence threshold and a human reviewer for the long tail. Designed for the 91%-accurate case to land automatically and the 9% to land safely.",
        stack: ["OpenAI", "Lambda", "n8n", "Python"],
      },
      {
        num: "PROJECT 03",
        title: "AI-driven artifact generation in delivery workflows.",
        description:
          "Pipelines that auto-generate Excel storyboards from Figma and legacy UI metadata — eliminating 6–12 hours of manual documentation per screen and delivering 40–70× gains.",
        stack: ["Python", "Figma API", "n8n", "Excel"],
      },
    ],
  },

  skills: {
    heading: {
      num: "05",
      title: "Capabilities",
      meta: "/ stack & practice",
      lead: "The tools, languages, and disciplines I reach for. **Depth in Java/Spring and AWS**; breadth across data, AI, DevOps, and the practice of running engineering teams.",
    },
    groups: [
      {
        name: "Languages & Frameworks",
        skills: [
          "Java",
          "Spring Boot",
          "Microservices",
          "Python",
          "Flask",
          "REST",
          "GraphQL",
          "JPA",
          "Hibernate",
          "Angular",
          "React",
          "HTML",
          "CSS",
        ],
      },
      {
        name: "Cloud & Infrastructure",
        skills: [
          "AWS EC2",
          "S3",
          "IAM",
          "Lambda",
          "SES",
          "CloudFront",
          "CloudWatch",
          "CodeCommit",
          "Azure API Management",
          "Azure DevOps",
          "MS Entra (SSO)",
          "Docker",
          "Kubernetes",
          "Tomcat",
          "WebSphere",
        ],
      },
      {
        name: "DevOps & Quality",
        skills: [
          "Jenkins",
          "AWS CodePipeline",
          "SonarQube",
          "JaCoCo",
          "JUnit",
          "TDD",
          "JMeter",
          "Maven",
          "Git",
          "SVN",
          "TFS",
          "OpCon Scheduler",
        ],
      },
      {
        name: "Data & Messaging",
        skills: [
          "Oracle",
          "SQL Server",
          "MySQL",
          "DB2",
          "NoSQL",
          "Kafka",
          "ChromaDB",
        ],
      },
      {
        name: "AI & Intelligent Systems",
        skills: [
          "RAG",
          "OpenAI",
          "LLM Integration",
          "Prompt Engineering",
          "n8n",
          "CUDA",
          "Vector DB",
          "OCR Pipelines",
        ],
      },
      {
        name: "Legacy & Mainframe",
        skills: ["COBOL", "CoolGen", "CopyBooks", "JCL", "Log4j"],
      },
      {
        name: "Process & Leadership",
        skills: [
          "Engineering Management",
          "Mentorship",
          "Stakeholder Mgmt",
          "Agile / Scrum",
          "Sprint Management",
          "Compliance & Audit Workflows",
          "Architecture Reviews",
          "Roadmap Planning",
        ],
      },
      {
        name: "Collaboration & Docs",
        skills: [
          "JIRA",
          "X-Ray",
          "Swagger",
          "Confluence",
          "Figma",
          "Draw.io",
          "Excel",
          "Lovable",
        ],
      },
    ],
  },

  recognition: {
    heading: {
      num: "06",
      title: "Recognition",
      meta: "/ credentials & education",
      lead: "Certifications I've earned, awards I've been recognized with, and the academic foundation under all of it.",
    },
    columns: [
      {
        heading: "Certifications",
        items: [
          { what: "Azure AI Fundamentals", by: "Microsoft" },
          {
            what: "Fundamentals of Accelerated Computing with CUDA Python",
            by: "NVIDIA",
          },
          { what: "Generative AI Engineer", by: "Deloitte" },
          { what: "Generative AI Prompt Engineer", by: "Deloitte" },
          {
            what: "Building Scalable Java Microservices with Spring Boot & Cloud",
            by: "Coursera",
          },
        ],
      },
      {
        heading: "Awards & Publications",
        items: [
          {
            what: "Outstanding Performance Award — Coaching & Team Leadership",
            by: "Deloitte",
          },
          { what: "Applause Award — Automation impact", by: "Deloitte" },
          {
            what: "White paper: Intranet Conferencing Solution",
            by: "IJETAE",
          },
        ],
        extraHeading: "Education",
        extraItems: [
          {
            what: "M.S. in Computer Science",
            by: "Florida State University · 2013–16",
          },
          {
            what: "B.E. in Computer Engineering",
            by: "Pune University · 2008–12",
          },
        ],
      },
    ],
  },

  contact: {
    heading: { num: "07", title: "Contact", meta: "/ open to senior roles" },
    lead: [
      { text: "Building something " },
      { text: "non-trivial", accent: true, italic: true },
      { text: " at the systems layer? I'd like to hear about it." },
    ],
    blurb:
      "Open to Software Development Manager, Engineering Manager, Staff Engineer, Principal Engineer, and Technical Lead roles — full-time or contract. Pune or remote-friendly.",
    availability: "Available for senior roles · Pune or remote",
    cta: {
      label: "Email Me",
      href: "mailto:swapnil.d.kharche@gmail.com",
      primary: true,
      icon: "mail",
    },
    rows: [
      {
        icon: "mail",
        label: "email",
        value: "swapnil.d.kharche@gmail.com",
        href: "mailto:swapnil.d.kharche@gmail.com",
      },
      {
        icon: "phone",
        label: "phone",
        value: "+91-9699668592",
        href: "tel:+919699668592",
      },
      {
        icon: "linkedin",
        label: "linkedin",
        value: "/in/swapnildkharche",
        href: "https://www.linkedin.com/in/swapnildkharche/",
      },
      { icon: "pin", label: "location", value: "Pune, India" },
    ],
  },

  footer: {
    copyrightName: "Swapnil Kharche",
    build: "v1.0",
  },
};
