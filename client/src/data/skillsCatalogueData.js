/**
 * Master Skills Catalogue & Categories Dataset
 * Matches MySQL database skills_catalogue table with 102 standard competencies.
 * Serves as resilient instant offline/cache fallback for Skill Analyzer.
 */

export const SKILL_CATEGORIES = [
  {
    "name": "Backend",
    "count": 11
  },
  {
    "name": "Cybersecurity",
    "count": 8
  },
  {
    "name": "Data Science & AI",
    "count": 15
  },
  {
    "name": "Databases",
    "count": 8
  },
  {
    "name": "DevOps & Cloud",
    "count": 13
  },
  {
    "name": "Frontend",
    "count": 11
  },
  {
    "name": "Other",
    "count": 17
  },
  {
    "name": "Programming Languages",
    "count": 13
  },
  {
    "name": "Testing & QA",
    "count": 3
  },
  {
    "name": "UI/UX Design",
    "count": 3
  }
];

export const SKILL_CATALOGUE = [
  {
    "id": "django",
    "name": "Django",
    "category": "Backend",
    "isPopular": true,
    "description": "High-level Python web framework encouraging clean design"
  },
  {
    "id": "express-js",
    "name": "Express.js",
    "category": "Backend",
    "isPopular": true,
    "description": "Fast, unopinionated, minimalist web framework for Node.js"
  },
  {
    "id": "microservices",
    "name": "Microservices & Distributed Systems",
    "category": "Backend",
    "isPopular": true,
    "description": "Domain-driven design, gRPC, event streaming, and API gateways"
  },
  {
    "id": "node-js",
    "name": "Node.js",
    "category": "Backend",
    "isPopular": true,
    "description": "Asynchronous event-driven JavaScript runtime"
  },
  {
    "id": "rest-apis",
    "name": "REST APIs",
    "category": "Backend",
    "isPopular": true,
    "description": "Architectural style for distributed hypermedia systems"
  },
  {
    "id": "asp-net-core",
    "name": "ASP.NET Core",
    "category": "Backend",
    "isPopular": false,
    "description": "Cross-platform framework for building cloud-connected web services"
  },
  {
    "id": "fastapi",
    "name": "FastAPI",
    "category": "Backend",
    "isPopular": false,
    "description": "High-performance Python web framework for building APIs with type hints"
  },
  {
    "id": "flask",
    "name": "Flask",
    "category": "Backend",
    "isPopular": false,
    "description": "Lightweight WSGI Python micro web framework"
  },
  {
    "id": "graphql",
    "name": "GraphQL",
    "category": "Backend",
    "isPopular": false,
    "description": "Query language for APIs and runtime for fulfilling queries"
  },
  {
    "id": "nest-js",
    "name": "NestJS",
    "category": "Backend",
    "isPopular": false,
    "description": "Progressive TypeScript framework for building scalable server-side apps"
  },
  {
    "id": "spring-boot",
    "name": "Spring Boot",
    "category": "Backend",
    "isPopular": false,
    "description": "Enterprise Java framework for production-ready microservices"
  },
  {
    "id": "cloud-security",
    "name": "Cloud Security & DevSecOps",
    "category": "Cybersecurity",
    "isPopular": true,
    "description": "IAM hardening, container vulnerability scanning, and CSPM"
  },
  {
    "id": "penetration-testing",
    "name": "Penetration Testing & Burp Suite",
    "category": "Cybersecurity",
    "isPopular": true,
    "description": "Offensive vulnerability assessment, exploitation, and reporting"
  },
  {
    "id": "siem-soc",
    "name": "SIEM, SOC & Incident Response",
    "category": "Cybersecurity",
    "isPopular": true,
    "description": "Splunk, Sentinel, log correlation, and threat containment"
  },
  {
    "id": "cryptography",
    "name": "Cryptography Basics",
    "category": "Cybersecurity",
    "isPopular": false,
    "description": "Symmetric/asymmetric encryption, hashing, digital signatures, and PKI"
  },
  {
    "id": "cybersecurity-fundamentals",
    "name": "Cybersecurity Fundamentals",
    "category": "Cybersecurity",
    "isPopular": false,
    "description": "Core principles of information security, CIA triad, and risk mitigation"
  },
  {
    "id": "digital-forensics",
    "name": "Digital Forensics & Malware Analysis",
    "category": "Cybersecurity",
    "isPopular": false,
    "description": "Memory extraction, disk triage, and reverse engineering"
  },
  {
    "id": "network-security",
    "name": "Network Security",
    "category": "Cybersecurity",
    "isPopular": false,
    "description": "Firewalls, VPNs, IDS/IPS, protocol analysis, and traffic monitoring"
  },
  {
    "id": "owasp-web-security",
    "name": "OWASP & Web Security",
    "category": "Cybersecurity",
    "isPopular": false,
    "description": "Securing web applications against top vulnerabilities (XSS, SQLi, CSRF)"
  },
  {
    "id": "deep-learning",
    "name": "Deep Learning & Neural Networks",
    "category": "Data Science & AI",
    "isPopular": true,
    "description": "CNNs, Transformers, and deep representation learning"
  },
  {
    "id": "langchain",
    "name": "LangChain & Multi-Agent Frameworks",
    "category": "Data Science & AI",
    "isPopular": true,
    "description": "Chaining LLMs, vector search, and autonomous agent loops"
  },
  {
    "id": "llm-engineering",
    "name": "LLM Fine-Tuning & Prompt Engineering",
    "category": "Data Science & AI",
    "isPopular": true,
    "description": "Techniques for prompting, LoRA fine-tuning, and model evaluation"
  },
  {
    "id": "machine-learning",
    "name": "Machine Learning",
    "category": "Data Science & AI",
    "isPopular": true,
    "description": "Statistical models and algorithms enabling computers to learn from data"
  },
  {
    "id": "power-bi",
    "name": "Power BI",
    "category": "Data Science & AI",
    "isPopular": true,
    "description": "Interactive data visualization software with business intelligence tools"
  },
  {
    "id": "pytorch",
    "name": "PyTorch",
    "category": "Data Science & AI",
    "isPopular": true,
    "description": "Optimized tensor library for deep learning using GPUs and CPUs"
  },
  {
    "id": "rag-vector-db",
    "name": "RAG Architectures & Vector Databases",
    "category": "Data Science & AI",
    "isPopular": true,
    "description": "Retrieval Augmented Generation with Pinecone, Milvus, Qdrant"
  },
  {
    "id": "tensorflow",
    "name": "TensorFlow",
    "category": "Data Science & AI",
    "isPopular": true,
    "description": "End-to-end open source platform for machine learning and deep learning"
  },
  {
    "id": "computer-vision",
    "name": "Computer Vision (OpenCV/YOLO)",
    "category": "Data Science & AI",
    "isPopular": false,
    "description": "Image processing, object detection, and visual recognition"
  },
  {
    "id": "gis-spatial",
    "name": "GIS & Spatial Data Analysis",
    "category": "Data Science & AI",
    "isPopular": false,
    "description": "QGIS, ArcGIS, GDAL, GeoPandas, and coordinate projections"
  },
  {
    "id": "nlp",
    "name": "Natural Language Processing (NLP)",
    "category": "Data Science & AI",
    "isPopular": false,
    "description": "Text classification, embeddings, and tokenization"
  },
  {
    "id": "numpy",
    "name": "NumPy",
    "category": "Data Science & AI",
    "isPopular": false,
    "description": "Fundamental package for scientific computing with multi-dimensional arrays"
  },
  {
    "id": "pandas",
    "name": "Pandas",
    "category": "Data Science & AI",
    "isPopular": false,
    "description": "Fast, powerful data analysis and manipulation library for Python"
  },
  {
    "id": "scikit-learn",
    "name": "Scikit-learn",
    "category": "Data Science & AI",
    "isPopular": false,
    "description": "Machine learning library for classification, regression, and clustering"
  },
  {
    "id": "tableau",
    "name": "Tableau",
    "category": "Data Science & AI",
    "isPopular": false,
    "description": "Visual analytics platform transforming data into actionable insights"
  },
  {
    "id": "mongodb",
    "name": "MongoDB",
    "category": "Databases",
    "isPopular": true,
    "description": "Document-oriented NoSQL database for flexible data schemas"
  },
  {
    "id": "mysql",
    "name": "MySQL",
    "category": "Databases",
    "isPopular": true,
    "description": "Relational database management system using structured query language"
  },
  {
    "id": "postgresql",
    "name": "PostgreSQL",
    "category": "Databases",
    "isPopular": true,
    "description": "Advanced open-source relational database with strong SQL compliance"
  },
  {
    "id": "redis",
    "name": "Redis",
    "category": "Databases",
    "isPopular": true,
    "description": "In-memory data structure store used as database, cache, and message broker"
  },
  {
    "id": "sql",
    "name": "SQL",
    "category": "Databases",
    "isPopular": true,
    "description": "Standard language for storing, manipulating and retrieving data in databases"
  },
  {
    "id": "dynamodb",
    "name": "DynamoDB",
    "category": "Databases",
    "isPopular": false,
    "description": "Amazon managed serverless key-value and document database"
  },
  {
    "id": "firebase",
    "name": "Firebase",
    "category": "Databases",
    "isPopular": false,
    "description": "Google cloud platform providing real-time NoSQL Firestore database"
  },
  {
    "id": "sqlite",
    "name": "SQLite",
    "category": "Databases",
    "isPopular": false,
    "description": "Self-contained, serverless, zero-configuration SQL database engine"
  },
  {
    "id": "aws",
    "name": "AWS",
    "category": "DevOps & Cloud",
    "isPopular": true,
    "description": "Amazon Web Services cloud computing platform"
  },
  {
    "id": "docker",
    "name": "Docker",
    "category": "DevOps & Cloud",
    "isPopular": true,
    "description": "Platform for developing, shipping, and running applications in containers"
  },
  {
    "id": "git",
    "name": "Git",
    "category": "DevOps & Cloud",
    "isPopular": true,
    "description": "Distributed version control system for tracking source code changes"
  },
  {
    "id": "github-actions",
    "name": "GitHub Actions",
    "category": "DevOps & Cloud",
    "isPopular": true,
    "description": "Continuous integration and continuous delivery (CI/CD) automation"
  },
  {
    "id": "linux",
    "name": "Linux",
    "category": "DevOps & Cloud",
    "isPopular": true,
    "description": "Open source operating system kernel and server administration"
  },
  {
    "id": "mlops",
    "name": "MLOps & Model Deployment",
    "category": "DevOps & Cloud",
    "isPopular": true,
    "description": "Model CI/CD pipelines, tracking, and inference servers"
  },
  {
    "id": "monitoring-prometheus",
    "name": "Prometheus & Grafana Monitoring",
    "category": "DevOps & Cloud",
    "isPopular": true,
    "description": "Metrics scraping, alerting rules, and observability dashboards"
  },
  {
    "id": "site-reliability",
    "name": "SRE & Distributed Reliability",
    "category": "DevOps & Cloud",
    "isPopular": true,
    "description": "SLIs/SLOs, error budgets, chaos testing, and post-mortems"
  },
  {
    "id": "ansible",
    "name": "Ansible & Automation",
    "category": "DevOps & Cloud",
    "isPopular": false,
    "description": "Configuration management and multi-node infrastructure orchestration"
  },
  {
    "id": "azure",
    "name": "Azure",
    "category": "DevOps & Cloud",
    "isPopular": false,
    "description": "Microsoft cloud computing platform and services suite"
  },
  {
    "id": "gcp",
    "name": "Google Cloud (GCP)",
    "category": "DevOps & Cloud",
    "isPopular": false,
    "description": "Suite of cloud computing services by Google"
  },
  {
    "id": "kubernetes",
    "name": "Kubernetes",
    "category": "DevOps & Cloud",
    "isPopular": false,
    "description": "Container orchestration system for automating deployment and scaling"
  },
  {
    "id": "terraform",
    "name": "Terraform",
    "category": "DevOps & Cloud",
    "isPopular": false,
    "description": "Infrastructure as Code software tool for cloud provisioning"
  },
  {
    "id": "flutter",
    "name": "Flutter & Dart",
    "category": "Frontend",
    "isPopular": true,
    "description": "Cross-platform native mobile app framework by Google"
  },
  {
    "id": "next-js",
    "name": "Next.js",
    "category": "Frontend",
    "isPopular": true,
    "description": "React framework for server-side rendering, static generation, and full-stack web"
  },
  {
    "id": "react",
    "name": "React",
    "category": "Frontend",
    "isPopular": true,
    "description": "Component-based library for building interactive user interfaces"
  },
  {
    "id": "react-native",
    "name": "React Native",
    "category": "Frontend",
    "isPopular": true,
    "description": "Cross-platform mobile apps using React and JavaScript"
  },
  {
    "id": "tailwind-css",
    "name": "Tailwind CSS",
    "category": "Frontend",
    "isPopular": true,
    "description": "Utility-first CSS framework for rapid responsive UI development"
  },
  {
    "id": "angular",
    "name": "Angular",
    "category": "Frontend",
    "isPopular": false,
    "description": "Enterprise-grade TypeScript web application framework"
  },
  {
    "id": "css",
    "name": "CSS",
    "category": "Frontend",
    "isPopular": false,
    "description": "Style sheet language for presentation and visual styling of web documents"
  },
  {
    "id": "html",
    "name": "HTML",
    "category": "Frontend",
    "isPopular": false,
    "description": "Standard markup language for documents designed for web browsers"
  },
  {
    "id": "redux",
    "name": "Redux",
    "category": "Frontend",
    "isPopular": false,
    "description": "Predictable state container for JavaScript apps"
  },
  {
    "id": "typescript-frontend",
    "name": "TypeScript (Frontend)",
    "category": "Frontend",
    "isPopular": false,
    "description": "Type-safe JavaScript for robust frontend architectures"
  },
  {
    "id": "vue-js",
    "name": "Vue.js",
    "category": "Frontend",
    "isPopular": false,
    "description": "Progressive JavaScript framework for modern web interfaces"
  },
  {
    "id": "product-management",
    "name": "Product Strategy & Roadmapping",
    "category": "Other",
    "isPopular": true,
    "description": "User stories, sprint planning, PRDs, and OKR alignment"
  },
  {
    "id": "unity",
    "name": "Unity Engine & C# Game Development",
    "category": "Other",
    "isPopular": true,
    "description": "3D game mechanics, physics engines, and VR/AR interactive experiences"
  },
  {
    "id": "agile-scrum",
    "name": "Agile & Scrum",
    "category": "Other",
    "isPopular": false,
    "description": "Iterative project management and sprint lifecycle methodologies"
  },
  {
    "id": "business-analysis",
    "name": "Business Analysis & Requirement Engineering",
    "category": "Other",
    "isPopular": false,
    "description": "BPMN process flows, stakeholder interviews, and gap analysis"
  },
  {
    "id": "embedded-systems",
    "name": "Embedded Systems & Firmware",
    "category": "Other",
    "isPopular": false,
    "description": "Microcontrollers, ARM Cortex, UART/SPI, and board support packages"
  },
  {
    "id": "enterprise-architecture",
    "name": "Enterprise Systems Architecture",
    "category": "Other",
    "isPopular": false,
    "description": "TOGAF, strategic integration, and large-scale IT alignment"
  },
  {
    "id": "iot-mqtt",
    "name": "IoT Protocols & Edge Computing",
    "category": "Other",
    "isPopular": false,
    "description": "MQTT, CoAP, BLE, and edge sensor telemetry pipelines"
  },
  {
    "id": "itil-itsm",
    "name": "ITIL & IT Service Management",
    "category": "Other",
    "isPopular": false,
    "description": "Service desk SLA management, incident triage, and CMDB workflows"
  },
  {
    "id": "rtos",
    "name": "Real-Time Operating Systems (RTOS)",
    "category": "Other",
    "isPopular": false,
    "description": "Deterministic task scheduling with FreeRTOS and Zephyr"
  },
  {
    "id": "ros",
    "name": "Robot Operating System (ROS)",
    "category": "Other",
    "isPopular": false,
    "description": "Robotics sensor nodes, kinematics, navigation, and SLAM"
  },
  {
    "id": "salesforce",
    "name": "Salesforce CRM & Cloud",
    "category": "Other",
    "isPopular": false,
    "description": "Apex, Lightning components, and enterprise customer workflows"
  },
  {
    "id": "sap-erp",
    "name": "SAP ERP & Enterprise Applications",
    "category": "Other",
    "isPopular": false,
    "description": "SAP S/4HANA, ABAP, and corporate supply chain modules"
  },
  {
    "id": "system-design",
    "name": "System Design",
    "category": "Other",
    "isPopular": false,
    "description": "Architecture of high-concurrency, scalable, fault-tolerant distributed systems"
  },
  {
    "id": "technical-writing",
    "name": "Technical Documentation & API Specs",
    "category": "Other",
    "isPopular": false,
    "description": "OpenAPI/Swagger, Markdown, developer docs, and release notes"
  },
  {
    "id": "unreal-engine",
    "name": "Unreal Engine & C++",
    "category": "Other",
    "isPopular": false,
    "description": "Nanite, Lumen, Blueprints, and AAA graphical rendering pipelines"
  },
  {
    "id": "verilog-vhdl",
    "name": "Verilog & Digital Design",
    "category": "Other",
    "isPopular": false,
    "description": "FPGA programming, RTL design, and hardware description languages"
  },
  {
    "id": "web3-ethers",
    "name": "Web3.js & Blockchain Infrastructure",
    "category": "Other",
    "isPopular": false,
    "description": "Decentralized nodes, IPFS, and peer-to-peer protocols"
  },
  {
    "id": "java",
    "name": "Java",
    "category": "Programming Languages",
    "isPopular": true,
    "description": "Class-based, object-oriented language for enterprise applications"
  },
  {
    "id": "javascript",
    "name": "JavaScript",
    "category": "Programming Languages",
    "isPopular": true,
    "description": "Dynamic scripting language powering modern interactive web applications"
  },
  {
    "id": "problem-solving",
    "name": "Problem Solving",
    "category": "Programming Languages",
    "isPopular": true,
    "description": "Data structures, algorithms, and computational problem solving"
  },
  {
    "id": "python",
    "name": "Python",
    "category": "Programming Languages",
    "isPopular": true,
    "description": "Versatile high-level programming language for web, AI, and scripting"
  },
  {
    "id": "c-language",
    "name": "C Programming",
    "category": "Programming Languages",
    "isPopular": false,
    "description": "Low-level systems programming, pointers, and memory manipulation"
  },
  {
    "id": "csharp",
    "name": "C#",
    "category": "Programming Languages",
    "isPopular": false,
    "description": "Modern, object-oriented language designed by Microsoft for .NET"
  },
  {
    "id": "cpp",
    "name": "C++",
    "category": "Programming Languages",
    "isPopular": false,
    "description": "High-performance systems programming language with generic features"
  },
  {
    "id": "golang",
    "name": "Go (Golang)",
    "category": "Programming Languages",
    "isPopular": false,
    "description": "Statically typed, compiled language engineered by Google for concurrency"
  },
  {
    "id": "kotlin-android",
    "name": "Kotlin & Android Development",
    "category": "Programming Languages",
    "isPopular": false,
    "description": "Native Android application development with Jetpack Compose"
  },
  {
    "id": "rust",
    "name": "Rust",
    "category": "Programming Languages",
    "isPopular": false,
    "description": "Systems programming language focused on safety, speed, and concurrency"
  },
  {
    "id": "solidity",
    "name": "Solidity & Smart Contract Development",
    "category": "Programming Languages",
    "isPopular": false,
    "description": "EVM bytecode, smart contract security audits, and Hardhat"
  },
  {
    "id": "swift-ios",
    "name": "Swift & iOS Development",
    "category": "Programming Languages",
    "isPopular": false,
    "description": "Native Apple iOS, iPadOS, and macOS software engineering"
  },
  {
    "id": "typescript",
    "name": "TypeScript",
    "category": "Programming Languages",
    "isPopular": false,
    "description": "Strongly typed programming language that builds on JavaScript"
  },
  {
    "id": "api-testing",
    "name": "API Testing (Postman)",
    "category": "Testing & QA",
    "isPopular": false,
    "description": "Validation of endpoints, status codes, response payloads, and schemas"
  },
  {
    "id": "automated-testing",
    "name": "Automated Testing / Jest / Cypress",
    "category": "Testing & QA",
    "isPopular": false,
    "description": "Unit, integration, and end-to-end automated testing frameworks"
  },
  {
    "id": "selenium",
    "name": "Selenium / Playwright",
    "category": "Testing & QA",
    "isPopular": false,
    "description": "Browser automation and cross-browser regression test suites"
  },
  {
    "id": "figma",
    "name": "Figma / UI Design",
    "category": "UI/UX Design",
    "isPopular": false,
    "description": "Collaborative web application for interface design and vector graphics"
  },
  {
    "id": "user-research",
    "name": "User Research & Usability",
    "category": "UI/UX Design",
    "isPopular": false,
    "description": "Conducting user interviews, heuristic evaluations, and usability testing"
  },
  {
    "id": "wireframing",
    "name": "Wireframing & Prototyping",
    "category": "UI/UX Design",
    "isPopular": false,
    "description": "Creating user journey mockups, low/high-fidelity interactive prototypes"
  }
];
