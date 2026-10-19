/**
 * Master Skills Catalogue & Categories Dataset
 * Matches MySQL database skills_catalogue table with 65 standard competencies.
 * Serves as resilient instant offline/cache fallback for Skill Analyzer.
 */

export const SKILL_CATEGORIES = [
  { name: 'Frontend', count: 9 },
  { name: 'Backend', count: 10 },
  { name: 'Databases', count: 8 },
  { name: 'Programming Languages', count: 9 },
  { name: 'DevOps & Cloud', count: 9 },
  { name: 'Data Science & AI', count: 8 },
  { name: 'Cybersecurity', count: 4 },
  { name: 'Testing & QA', count: 3 },
  { name: 'UI/UX Design', count: 3 },
  { name: 'Other', count: 2 },
];

export const SKILL_CATALOGUE = [
  // FRONTEND (9)
  { id: 'react', name: 'React', category: 'Frontend', isPopular: true, description: 'Component-based library for building interactive user interfaces' },
  { id: 'angular', name: 'Angular', category: 'Frontend', isPopular: false, description: 'Enterprise-grade TypeScript web application framework' },
  { id: 'vue-js', name: 'Vue.js', category: 'Frontend', isPopular: false, description: 'Progressive JavaScript framework for modern web interfaces' },
  { id: 'next-js', name: 'Next.js', category: 'Frontend', isPopular: true, description: 'React framework for server-side rendering, static generation, and full-stack web' },
  { id: 'html', name: 'HTML', category: 'Frontend', isPopular: false, description: 'Standard markup language for documents designed for web browsers' },
  { id: 'css', name: 'CSS', category: 'Frontend', isPopular: false, description: 'Style sheet language for presentation and visual styling of web documents' },
  { id: 'tailwind-css', name: 'Tailwind CSS', category: 'Frontend', isPopular: true, description: 'Utility-first CSS framework for rapid responsive UI development' },
  { id: 'redux', name: 'Redux', category: 'Frontend', isPopular: false, description: 'Predictable state container for JavaScript apps' },
  { id: 'typescript-frontend', name: 'TypeScript (Frontend)', category: 'Frontend', isPopular: false, description: 'Type-safe JavaScript for robust frontend architectures' },

  // BACKEND (10)
  { id: 'node-js', name: 'Node.js', category: 'Backend', isPopular: true, description: 'Asynchronous event-driven JavaScript runtime' },
  { id: 'express-js', name: 'Express.js', category: 'Backend', isPopular: true, description: 'Fast, unopinionated, minimalist web framework for Node.js' },
  { id: 'django', name: 'Django', category: 'Backend', isPopular: true, description: 'High-level Python web framework encouraging clean design' },
  { id: 'flask', name: 'Flask', category: 'Backend', isPopular: false, description: 'Lightweight WSGI Python micro web framework' },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend', isPopular: false, description: 'High-performance Python web framework for building APIs with type hints' },
  { id: 'spring-boot', name: 'Spring Boot', category: 'Backend', isPopular: false, description: 'Enterprise Java framework for production-ready microservices' },
  { id: 'nest-js', name: 'NestJS', category: 'Backend', isPopular: false, description: 'Progressive TypeScript framework for building scalable server-side apps' },
  { id: 'asp-net-core', name: 'ASP.NET Core', category: 'Backend', isPopular: false, description: 'Cross-platform framework for building cloud-connected web services' },
  { id: 'rest-apis', name: 'REST APIs', category: 'Backend', isPopular: true, description: 'Architectural style for distributed hypermedia systems' },
  { id: 'graphql', name: 'GraphQL', category: 'Backend', isPopular: false, description: 'Query language for APIs and runtime for fulfilling queries' },

  // DATABASES (8)
  { id: 'mongodb', name: 'MongoDB', category: 'Databases', isPopular: true, description: 'Document-oriented NoSQL database for flexible data schemas' },
  { id: 'mysql', name: 'MySQL', category: 'Databases', isPopular: true, description: 'Relational database management system using structured query language' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', isPopular: true, description: 'Advanced open-source relational database with strong SQL compliance' },
  { id: 'redis', name: 'Redis', category: 'Databases', isPopular: true, description: 'In-memory data structure store used as database, cache, and message broker' },
  { id: 'firebase', name: 'Firebase', category: 'Databases', isPopular: false, description: 'Google cloud platform providing real-time NoSQL Firestore database' },
  { id: 'dynamodb', name: 'DynamoDB', category: 'Databases', isPopular: false, description: 'Amazon managed serverless key-value and document database' },
  { id: 'sqlite', name: 'SQLite', category: 'Databases', isPopular: false, description: 'Self-contained, serverless, zero-configuration SQL database engine' },
  { id: 'sql', name: 'SQL', category: 'Databases', isPopular: true, description: 'Standard language for storing, manipulating and retrieving data in databases' },

  // PROGRAMMING LANGUAGES (9)
  { id: 'python', name: 'Python', category: 'Programming Languages', isPopular: true, description: 'Versatile high-level programming language for web, AI, and scripting' },
  { id: 'java', name: 'Java', category: 'Programming Languages', isPopular: true, description: 'Class-based, object-oriented language for enterprise applications' },
  { id: 'cpp', name: 'C++', category: 'Programming Languages', isPopular: false, description: 'High-performance systems programming language with generic features' },
  { id: 'javascript', name: 'JavaScript', category: 'Programming Languages', isPopular: true, description: 'Dynamic scripting language powering modern interactive web applications' },
  { id: 'typescript', name: 'TypeScript', category: 'Programming Languages', isPopular: false, description: 'Strongly typed programming language that builds on JavaScript' },
  { id: 'csharp', name: 'C#', category: 'Programming Languages', isPopular: false, description: 'Modern, object-oriented language designed by Microsoft for .NET' },
  { id: 'golang', name: 'Go (Golang)', category: 'Programming Languages', isPopular: false, description: 'Statically typed, compiled language engineered by Google for concurrency' },
  { id: 'rust', name: 'Rust', category: 'Programming Languages', isPopular: false, description: 'Systems programming language focused on safety, speed, and concurrency' },
  { id: 'problem-solving', name: 'Problem Solving', category: 'Programming Languages', isPopular: true, description: 'Data structures, algorithms, and computational problem solving' },

  // DEVOPS & CLOUD (9)
  { id: 'docker', name: 'Docker', category: 'DevOps & Cloud', isPopular: true, description: 'Platform for developing, shipping, and running applications in containers' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps & Cloud', isPopular: false, description: 'Container orchestration system for automating deployment and scaling' },
  { id: 'aws', name: 'AWS', category: 'DevOps & Cloud', isPopular: true, description: 'Amazon Web Services cloud computing platform' },
  { id: 'azure', name: 'Azure', category: 'DevOps & Cloud', isPopular: false, description: 'Microsoft cloud computing platform and services suite' },
  { id: 'gcp', name: 'Google Cloud (GCP)', category: 'DevOps & Cloud', isPopular: false, description: 'Suite of cloud computing services by Google' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'DevOps & Cloud', isPopular: true, description: 'Continuous integration and continuous delivery (CI/CD) automation' },
  { id: 'terraform', name: 'Terraform', category: 'DevOps & Cloud', isPopular: false, description: 'Infrastructure as Code software tool for cloud provisioning' },
  { id: 'linux', name: 'Linux', category: 'DevOps & Cloud', isPopular: true, description: 'Open source operating system kernel and server administration' },
  { id: 'git', name: 'Git', category: 'DevOps & Cloud', isPopular: true, description: 'Distributed version control system for tracking source code changes' },

  // DATA SCIENCE & AI (8)
  { id: 'pandas', name: 'Pandas', category: 'Data Science & AI', isPopular: false, description: 'Fast, powerful data analysis and manipulation library for Python' },
  { id: 'numpy', name: 'NumPy', category: 'Data Science & AI', isPopular: false, description: 'Fundamental package for scientific computing with multi-dimensional arrays' },
  { id: 'scikit-learn', name: 'Scikit-learn', category: 'Data Science & AI', isPopular: false, description: 'Machine learning library for classification, regression, and clustering' },
  { id: 'tensorflow', name: 'TensorFlow', category: 'Data Science & AI', isPopular: true, description: 'End-to-end open source platform for machine learning and deep learning' },
  { id: 'pytorch', name: 'PyTorch', category: 'Data Science & AI', isPopular: true, description: 'Optimized tensor library for deep learning using GPUs and CPUs' },
  { id: 'power-bi', name: 'Power BI', category: 'Data Science & AI', isPopular: true, description: 'Interactive data visualization software with business intelligence tools' },
  { id: 'tableau', name: 'Tableau', category: 'Data Science & AI', isPopular: false, description: 'Visual analytics platform transforming data into actionable insights' },
  { id: 'machine-learning', name: 'Machine Learning', category: 'Data Science & AI', isPopular: true, description: 'Statistical models and algorithms enabling computers to learn from data' },

  // CYBERSECURITY (4)
  { id: 'cybersecurity-fundamentals', name: 'Cybersecurity Fundamentals', category: 'Cybersecurity', isPopular: false, description: 'Core principles of information security, CIA triad, and risk mitigation' },
  { id: 'network-security', name: 'Network Security', category: 'Cybersecurity', isPopular: false, description: 'Firewalls, VPNs, IDS/IPS, protocol analysis, and traffic monitoring' },
  { id: 'owasp-web-security', name: 'OWASP & Web Security', category: 'Cybersecurity', isPopular: false, description: 'Securing web applications against top vulnerabilities (XSS, SQLi, CSRF)' },
  { id: 'cryptography', name: 'Cryptography Basics', category: 'Cybersecurity', isPopular: false, description: 'Symmetric/asymmetric encryption, hashing, digital signatures, and PKI' },

  // TESTING & QA (3)
  { id: 'automated-testing', name: 'Automated Testing / Jest / Cypress', category: 'Testing & QA', isPopular: false, description: 'Unit, integration, and end-to-end automated testing frameworks' },
  { id: 'selenium', name: 'Selenium / Playwright', category: 'Testing & QA', isPopular: false, description: 'Browser automation and cross-browser regression test suites' },
  { id: 'api-testing', name: 'API Testing (Postman)', category: 'Testing & QA', isPopular: false, description: 'Validation of endpoints, status codes, response payloads, and schemas' },

  // UI/UX DESIGN (3)
  { id: 'figma', name: 'Figma / UI Design', category: 'UI/UX Design', isPopular: false, description: 'Collaborative web application for interface design and vector graphics' },
  { id: 'wireframing', name: 'Wireframing & Prototyping', category: 'UI/UX Design', isPopular: false, description: 'Creating user journey mockups, low/high-fidelity interactive prototypes' },
  { id: 'user-research', name: 'User Research & Usability', category: 'UI/UX Design', isPopular: false, description: 'Conducting user interviews, heuristic evaluations, and usability testing' },

  // OTHER (2)
  { id: 'agile-scrum', name: 'Agile & Scrum', category: 'Other', isPopular: false, description: 'Iterative project management and sprint lifecycle methodologies' },
  { id: 'system-design', name: 'System Design', category: 'Other', isPopular: false, description: 'Architecture of high-concurrency, scalable, fault-tolerant distributed systems' },
];
