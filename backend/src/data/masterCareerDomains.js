/**
 * CampusCorp IT Career Explorer - Master IT Domains & Job Roles 2026 Catalogue (Expanded Edition)
 * Comprehensive coverage across 52+ technical domains organized into 10 industrial career families.
 * Benchmarks: O*NET Online (US BLS 2026), SFIA 9, NIST NICE, CNCF, and NASSCOM.
 */

export const CAREER_FAMILIES = [
  "All Families",
  "Software, Systems & Web Engineering",
  "Data Science, Analytics & Big Data",
  "Artificial Intelligence, GenAI & Autonomous Systems",
  "Cloud Computing, DevOps & Platform Engineering",
  "Cybersecurity, Information Assurance & Digital Trust",
  "Product Management, UI/UX & Quality Engineering",
  "Enterprise Business Systems & Process Automation",
  "Specialized & Deep Tech Engineering",
  "Industry Domain Technology (FinTech, HealthTech, GIS, SpaceTech)",
  "Technical Education, Governance & Executive Leadership"
];

export const CAREER_LEVELS = [
  'All Levels',
  'Entry-Level / Graduate',
  'Mid-Level (2-5 yrs)',
  'Senior / Specialist (5+ yrs)',
  'Lead / Architect (8+ yrs)',
];

export const CAREER_DOMAINS = [
  {
    "id": "web-development-frontend-engineering",
    "name": "Web Development & Frontend Engineering",
    "family": "Software, Systems & Web Engineering",
    "icon": "Layout",
    "shortDescription": "Architecting modern, performant, and accessible client-side web interfaces and responsive digital experiences.",
    "overview": "Frontend Engineering focuses on building the visual, interactive, and client-side layers of web applications. Modern frontend engineers engineer complex component hierarchies, state management flows, progressive web apps (PWAs), web vitals optimization, and seamless cross-browser experiences.",
    "whatProfessionalsDo": [
      "Translate UI/UX design specifications into pixel-perfect, accessible HTML, CSS/Tailwind, and modern JavaScript/TypeScript.",
      "Construct reactive single-page and server-rendered web applications using React, Next.js, Vue, or Angular.",
      "Optimize Core Web Vitals, Time to Interactive (TTI), bundle sizes, and client-side asset caching.",
      "Integrate RESTful, GraphQL, and WebSocket APIs with resilient error handling and optimistic UI updates."
    ],
    "coreTechnologies": [
      "JavaScript (ESNext)",
      "TypeScript",
      "React.js",
      "Next.js",
      "Tailwind CSS",
      "HTML5 & Semantic Web",
      "GraphQL",
      "Vite",
      "Redux / Zustand"
    ],
    "prerequisites": [
      "Basic HTML, CSS, and JavaScript programming",
      "DOM manipulation understanding",
      "Git version control basics"
    ],
    "relatedDomains": [
      "backend-api-development",
      "full-stack-enterprise-software",
      "ui-ux-product-design",
      "technical-writing-developer-experience"
    ],
    "careerProgression": "Junior Frontend Developer -> Frontend Engineer -> Senior UI/Frontend Architect -> Staff / Principal Web Engineer",
    "sortOrder": 1
  },
  {
    "id": "backend-api-development",
    "name": "Backend & API Development",
    "family": "Software, Systems & Web Engineering",
    "icon": "Server",
    "shortDescription": "Constructing robust server-side business logic, resilient microservices, high-throughput REST/GraphQL APIs, and database transactions.",
    "overview": "Backend & API Development encompasses the server-side infrastructure and distributed architecture that powers business applications. Engineers design scalable microservices, manage database concurrency, enforce authentication, and build robust integrations.",
    "whatProfessionalsDo": [
      "Architect and deploy high-throughput microservices and RESTful / gRPC APIs.",
      "Design relational and NoSQL schemas with indexing, query optimization, and ACID transaction safety.",
      "Implement asynchronous job queues, distributed message buses (Kafka, RabbitMQ), and caching layers (Redis).",
      "Enforce API security, OAuth2/JWT token authorization, rate limiting, and input validation."
    ],
    "coreTechnologies": [
      "Node.js & Express",
      "Go (Golang)",
      "Java & Spring Boot",
      "Python (FastAPI)",
      "PostgreSQL & MySQL",
      "Redis",
      "Kafka",
      "Docker"
    ],
    "prerequisites": [
      "Proficiency in at least one server-side language",
      "SQL fundamentals and relational data modeling",
      "HTTP protocol and REST design patterns"
    ],
    "relatedDomains": [
      "web-development-frontend-engineering",
      "full-stack-enterprise-software",
      "database-data-platform-administration",
      "cloud-computing-cloud-engineering"
    ],
    "careerProgression": "Junior Backend Developer -> Backend Software Engineer -> Senior Distributed Systems Engineer -> Principal Backend Architect",
    "sortOrder": 2
  },
  {
    "id": "full-stack-enterprise-software",
    "name": "Full-Stack & Enterprise Software",
    "family": "Software, Systems & Web Engineering",
    "icon": "Layers",
    "shortDescription": "Delivering end-to-end multi-tier business applications spanning client interfaces, distributed business services, and database layers.",
    "overview": "Full-Stack & Enterprise Software combines end-to-end software craftsmanship with large-scale enterprise integration. Full-stack engineers bridge frontend interaction with backend data pipelines, delivering complete SaaS platforms and enterprise tools.",
    "whatProfessionalsDo": [
      "Develop end-to-end enterprise web applications connecting interactive frontend dashboards with microservices backends.",
      "Design comprehensive data models, authorization matrices, and tenancy architectures.",
      "Manage full CI/CD deployment lifecycles from local container testing to production deployment.",
      "Perform root-cause system debugging across client, server, network, and database layers."
    ],
    "coreTechnologies": [
      "React / Next.js",
      "Node.js / Express",
      "Java & Spring Boot",
      "TypeScript",
      "PostgreSQL",
      "Docker",
      "Redis",
      "Tailwind CSS"
    ],
    "prerequisites": [
      "Both frontend JavaScript and backend programming foundations",
      "Database design concepts",
      "Understanding of full-stack client-server lifecycle"
    ],
    "relatedDomains": [
      "web-development-frontend-engineering",
      "backend-api-development",
      "cloud-computing-cloud-engineering",
      "devops-platform-engineering-sre"
    ],
    "careerProgression": "Junior Full-Stack Developer -> Full-Stack Software Engineer -> Lead Enterprise Engineer -> Solutions Architect",
    "sortOrder": 3
  },
  {
    "id": "mobile-application-development",
    "name": "Mobile Application Development",
    "family": "Software, Systems & Web Engineering",
    "icon": "Smartphone",
    "shortDescription": "Crafting native iOS, Android, and cross-platform mobile apps with responsive touch UIs, offline databases, and hardware sensors.",
    "overview": "Mobile Application Development focuses on mobile operating systems (iOS and Android). Mobile engineers develop native (Swift, Kotlin) and cross-platform (Flutter, React Native) applications that leverage device hardware, camera, GPS, and push notification services.",
    "whatProfessionalsDo": [
      "Build native iOS and Android apps using Swift/SwiftUI and Kotlin/Jetpack Compose.",
      "Develop high-performance cross-platform applications using Flutter or React Native.",
      "Implement offline-first data caching with SQLite / Room / CoreData and background synchronization.",
      "Optimize battery consumption, touch responsiveness, rendering frame rates (60/120fps), and memory footprint."
    ],
    "coreTechnologies": [
      "Kotlin & Android SDK",
      "Swift & SwiftUI",
      "Flutter & Dart",
      "React Native",
      "SQLite / Realm",
      "Firebase",
      "REST & GraphQL"
    ],
    "prerequisites": [
      "Object-oriented programming (Java/Kotlin or Swift or JS)",
      "Mobile UI layouts and lifecycle concepts",
      "Basic API consumption"
    ],
    "relatedDomains": [
      "web-development-frontend-engineering",
      "ui-ux-product-design",
      "backend-api-development"
    ],
    "careerProgression": "Junior Mobile App Developer -> Mobile Software Engineer -> Lead Mobile Architect -> Head of Mobile Engineering",
    "sortOrder": 4
  },
  {
    "id": "desktop-systems-embedded-software",
    "name": "Desktop, Systems & Embedded Software",
    "family": "Software, Systems & Web Engineering",
    "icon": "Cpu",
    "shortDescription": "Low-level systems programming, real-time operating systems (RTOS), hardware firmware, device drivers, and cross-platform desktop applications.",
    "overview": "This domain encompasses systems software and firmware operating near the hardware interface. Systems engineers work with C, C++, and Rust to write kernel modules, device drivers, real-time embedded systems, and resource-constrained microcontrollers.",
    "whatProfessionalsDo": [
      "Write deterministic, high-efficiency C, C++, and Rust code for embedded microcontrollers and microprocessors.",
      "Develop cross-platform desktop native software using modern C++, Qt, or Electron/Tauri.",
      "Interface with hardware peripherals over I2C, SPI, UART, CAN bus, and USB protocols.",
      "Debug low-level system faults using logic analyzers, JTAG/SWD emulators, and GDB."
    ],
    "coreTechnologies": [
      "C (C11/C17)",
      "C++ (C++17/20)",
      "Rust",
      "Linux Kernel & POSIX",
      "RTOS (FreeRTOS)",
      "Qt Framework",
      "CMake",
      "Embedded ARM Cortex"
    ],
    "prerequisites": [
      "Strong C or C++ fundamentals",
      "Computer architecture and memory management (pointers, stack vs heap)",
      "Basic digital electronics"
    ],
    "relatedDomains": [
      "robotics-iot-industrial-automation",
      "hardware-semiconductor-computer-engineering",
      "networking-telecommunications"
    ],
    "careerProgression": "Junior Firmware/Systems Engineer -> Embedded Software Engineer -> Senior Systems Architect -> Chief Technology Architect",
    "sortOrder": 5
  },
  {
    "id": "data-analytics-business-intelligence",
    "name": "Data Analytics & Business Intelligence",
    "family": "Data Science, Analytics & Big Data",
    "icon": "BarChart3",
    "shortDescription": "Transforming raw organizational data into actionable strategic dashboards, KPI reports, metric telemetry, and commercial insights.",
    "overview": "Data Analytics & BI translates corporate operational data into visual intelligence. Analysts build interactive dashboards, define business metrics, perform ad-hoc SQL investigations, and guide leadership in data-driven decision making.",
    "whatProfessionalsDo": [
      "Design, build, and maintain enterprise executive dashboards in Power BI, Tableau, and Looker.",
      "Write complex analytical SQL queries with window functions, CTEs, and aggregation rollups.",
      "Collaborate with business stakeholders to define and monitor KPIs, conversion funnels, and revenue metrics.",
      "Automate repetitive reporting pipelines and validate data accuracy across disparate business systems."
    ],
    "coreTechnologies": [
      "SQL (Advanced)",
      "Power BI",
      "Tableau",
      "Python (Pandas, Seaborn)",
      "Excel & DAX",
      "Snowflake",
      "BigQuery",
      "dbt"
    ],
    "prerequisites": [
      "Relational database query skills (SQL)",
      "Statistical literacy (mean, median, standard deviation)",
      "Analytical problem-solving"
    ],
    "relatedDomains": [
      "data-science-statistical-modeling",
      "data-engineering-big-data",
      "product-management-business-analysis",
      "fintech-financial-technology"
    ],
    "careerProgression": "Junior Data Analyst -> BI / Analytics Specialist -> Lead Business Intelligence Architect -> Director of Enterprise Analytics",
    "sortOrder": 6
  },
  {
    "id": "data-science-statistical-modeling",
    "name": "Data Science & Statistical Modeling",
    "family": "Data Science, Analytics & Big Data",
    "icon": "Binary",
    "shortDescription": "Extracting predictive patterns through mathematical modeling, hypothesis testing, machine learning pipelines, and experimental analysis.",
    "overview": "Data Science combines statistical rigor, experimental design, and predictive algorithms to solve complex business problems. Data scientists build customer churn predictors, lifetime value estimators, recommendation scoring engines, and A/B test experiments.",
    "whatProfessionalsDo": [
      "Formulate statistical hypotheses, design randomized controlled A/B testing protocols, and measure significance.",
      "Cleanse, impute, and feature-engineer massive tabular datasets using Python and R.",
      "Train, cross-validate, and evaluate predictive models (XGBoost, Random Forests, Logistic Regressions).",
      "Translate experimental outcomes into business recommendations for executives and product teams."
    ],
    "coreTechnologies": [
      "Python",
      "Scikit-Learn",
      "Pandas & NumPy",
      "R Programming",
      "SQL",
      "Jupyter",
      "Statsmodels",
      "MLflow",
      "Matplotlib"
    ],
    "prerequisites": [
      "Calculus, linear algebra, and probability theory",
      "Proficiency in Python data stack",
      "Fundamental machine learning concepts"
    ],
    "relatedDomains": [
      "data-analytics-business-intelligence",
      "artificial-intelligence-machine-learning",
      "data-engineering-big-data"
    ],
    "careerProgression": "Associate Data Scientist -> Data Scientist -> Staff Data Scientist -> Head of Applied Data Science",
    "sortOrder": 7
  },
  {
    "id": "artificial-intelligence-machine-learning",
    "name": "Artificial Intelligence & Machine Learning",
    "family": "Artificial Intelligence, GenAI & Autonomous Systems",
    "icon": "BrainCircuit",
    "shortDescription": "Developing deep learning neural networks, computer vision systems, natural language processing, and automated inference algorithms.",
    "overview": "AI & ML focuses on algorithms that learn representations directly from data. Engineers build neural architectures for computer vision, audio recognition, natural language comprehension, and reinforcement learning.",
    "whatProfessionalsDo": [
      "Design, train, and fine-tune convolutional neural networks (CNNs), Transformers, and recurrent models.",
      "Develop computer vision pipelines for object detection, segmentation, and facial recognition.",
      "Build NLP pipelines for sentiment analysis, semantic embedding search, and entity extraction.",
      "Profile and optimize model inference latency for deployment on edge and cloud GPU instances."
    ],
    "coreTechnologies": [
      "PyTorch",
      "TensorFlow / Keras",
      "Python",
      "OpenCV",
      "Hugging Face Transformers",
      "CUDA / cuDNN",
      "Scikit-Learn",
      "NumPy"
    ],
    "prerequisites": [
      "Multivariate calculus and linear algebra",
      "Deep learning theory and gradient descent",
      "Strong Python programming"
    ],
    "relatedDomains": [
      "generative-ai-llm-engineering",
      "mlops-ai-infrastructure-responsible-ai",
      "data-science-statistical-modeling"
    ],
    "careerProgression": "Junior ML Engineer -> Machine Learning Scientist -> Lead AI Researcher -> Principal Artificial Intelligence Architect",
    "sortOrder": 8
  },
  {
    "id": "generative-ai-llm-engineering",
    "name": "Generative AI & LLM Engineering",
    "family": "Artificial Intelligence, GenAI & Autonomous Systems",
    "icon": "Sparkles",
    "shortDescription": "Building Retrieval-Augmented Generation (RAG) pipelines, fine-tuning large language models, agentic workflows, and diffusion systems.",
    "overview": "Generative AI & LLM Engineering is the modern frontier of generative foundation models. Engineers build RAG architectures, multi-agent reasoning loops, context window management, prompt optimization frameworks, and custom model parameter fine-tuning (LoRA/QLoRA).",
    "whatProfessionalsDo": [
      "Architect enterprise Retrieval-Augmented Generation (RAG) platforms using vector databases and re-ranking models.",
      "Fine-tune foundation models (Mistral, LLaMA, DeepSeek) using parameter-efficient fine-tuning (PEFT/LoRA).",
      "Design multi-agent collaborative workflows using LangChain, LlamaIndex, and AutoGen.",
      "Implement safety guardrails, prompt injection defenses, and hallucination evaluation metrics."
    ],
    "coreTechnologies": [
      "LangChain / LlamaIndex",
      "Vector Databases (Chroma, Qdrant, Pinecone)",
      "Ollama / vLLM",
      "Python",
      "Hugging Face PEFT / LoRA",
      "OpenAI / Anthropic APIs",
      "Mistral 7B / LLaMA 3"
    ],
    "prerequisites": [
      "Python proficiency",
      "Fundamental NLP and transformer architecture knowledge",
      "Familiarity with embeddings and vector mathematics"
    ],
    "relatedDomains": [
      "artificial-intelligence-machine-learning",
      "mlops-ai-infrastructure-responsible-ai",
      "backend-api-development"
    ],
    "careerProgression": "Generative AI Developer -> LLM Systems Engineer -> Senior Generative AI Architect -> VP of Generative Technologies",
    "sortOrder": 9
  },
  {
    "id": "data-engineering-big-data",
    "name": "Data Engineering & Big Data",
    "family": "Data Science, Analytics & Big Data",
    "icon": "Database",
    "shortDescription": "Constructing scalable distributed ETL/ELT pipelines, streaming architectures, data lakehouses, and big data processing clusters.",
    "overview": "Data Engineering builds the foundational pipelines that ingest, clean, and store terabytes to petabytes of structured and unstructured information. Engineers work with Apache Spark, Kafka, Databricks, and modern data stack orchestrators.",
    "whatProfessionalsDo": [
      "Build resilient distributed streaming and batch data pipelines using Apache Spark, Flink, and Kafka.",
      "Design lakehouse architectures using Delta Lake, Apache Iceberg, Snowflake, and Databricks.",
      "Automate DAG workflows using Apache Airflow, Prefect, or Dagster.",
      "Enforce data governance, schema validation, data quality tests (Great Expectations), and lineage tracking."
    ],
    "coreTechnologies": [
      "Apache Spark (PySpark/Scala)",
      "Apache Kafka",
      "SQL & dbt",
      "Python",
      "Snowflake / BigQuery",
      "Databricks",
      "Apache Airflow",
      "AWS S3 / SQS"
    ],
    "prerequisites": [
      "Advanced SQL and Python or Scala",
      "Distributed computing fundamentals",
      "Relational and dimensional data modeling (Kimball)"
    ],
    "relatedDomains": [
      "database-data-platform-administration",
      "data-analytics-business-intelligence",
      "cloud-computing-cloud-engineering"
    ],
    "careerProgression": "Associate Data Engineer -> Data Engineer -> Lead Big Data Architect -> Director of Enterprise Data Engineering",
    "sortOrder": 10
  },
  {
    "id": "database-data-platform-administration",
    "name": "Database & Data Platform Administration",
    "family": "Data Science, Analytics & Big Data",
    "icon": "HardDrive",
    "shortDescription": "Ensuring continuous availability, replication, backup disaster recovery, performance tuning, and integrity of critical database engines.",
    "overview": "Database Administrators (DBAs) and Data Platform Engineers maintain the engines holding business data. They oversee replication topographies, high availability, clustering, point-in-time recovery, index optimization, and database security.",
    "whatProfessionalsDo": [
      "Manage high-availability database clusters with multi-region replication, failovers, and read-replicas.",
      "Perform database index tuning, query plan analysis, connection pool sizing, and memory buffer caching.",
      "Orchestrate backup regimes, point-in-time recovery testing, and disaster recovery drills.",
      "Implement database encryption at rest and in transit, user privileges, and audit log compliance."
    ],
    "coreTechnologies": [
      "PostgreSQL & pgAdmin",
      "MySQL & MariaDB",
      "Oracle Database",
      "MongoDB",
      "Redis",
      "Cassandra",
      "AWS RDS / Aurora",
      "Linux shell scripting"
    ],
    "prerequisites": [
      "Deep SQL knowledge and ACID transaction theory",
      "Operating systems and storage I/O concepts",
      "Linux systems administration basics"
    ],
    "relatedDomains": [
      "data-engineering-big-data",
      "cloud-computing-cloud-engineering",
      "it-infrastructure-systems-administration"
    ],
    "careerProgression": "Junior DBA -> Database Administrator (DBA) -> Database Reliability Engineer (DBRE) -> Chief Data Architect",
    "sortOrder": 11
  },
  {
    "id": "cloud-computing-cloud-engineering",
    "name": "Cloud Computing & Cloud Engineering",
    "family": "Cloud Computing, DevOps & Platform Engineering",
    "icon": "Cloud",
    "shortDescription": "Designing, provisioning, and scaling elastic, multi-region cloud infrastructures across AWS, Azure, and Google Cloud Platform.",
    "overview": "Cloud Engineering is the backbone of modern web hosting. Engineers translate business requirements into fault-tolerant, elastic cloud topologies leveraging compute instances, object storage, serverless functions, VPC networking, and IAM policies.",
    "whatProfessionalsDo": [
      "Provision scalable multi-region cloud architectures using Terraform, AWS CloudFormation, or Pulumi.",
      "Architect serverless compute, event-driven microservices, and auto-scaling compute clusters.",
      "Configure VPC subnets, transit gateways, route tables, security groups, and cloud load balancers.",
      "Optimize cloud billing, track FinOps cost allocations, and monitor resource utilization."
    ],
    "coreTechnologies": [
      "Amazon Web Services (AWS)",
      "Microsoft Azure",
      "Google Cloud Platform (GCP)",
      "Terraform (IaC)",
      "Docker & Kubernetes",
      "Linux",
      "Python & Bash"
    ],
    "prerequisites": [
      "Operating system fundamentals (Linux)",
      "Computer networking basics (IP, DNS, Subnets)",
      "Basic scripting (Python or Bash)"
    ],
    "relatedDomains": [
      "devops-platform-engineering-sre",
      "networking-telecommunications",
      "cybersecurity-information-security"
    ],
    "careerProgression": "Cloud Support Associate -> Cloud Solutions Engineer -> Senior Cloud Architect -> Chief Cloud Infrastructure Officer",
    "sortOrder": 12
  },
  {
    "id": "devops-platform-engineering-sre",
    "name": "DevOps, Platform Engineering & SRE",
    "family": "Cloud Computing, DevOps & Platform Engineering",
    "icon": "Terminal",
    "shortDescription": "Automating continuous integration and continuous delivery (CI/CD), container platforms, site reliability, and observability telemetry.",
    "overview": "DevOps & Site Reliability Engineering (SRE) bridges software developers and production operations. SREs establish error budgets, SLOs/SLIs, automated deployment pipelines, self-healing Kubernetes clusters, and end-to-end monitoring stacks.",
    "whatProfessionalsDo": [
      "Build robust CI/CD pipelines in GitHub Actions, GitLab CI, or Jenkins with automated testing and security scanning.",
      "Manage container orchestration environments using Kubernetes (EKS, GKE, Helm charts, ArgoCD).",
      "Deploy full-stack observability with Prometheus, Grafana, Loki, OpenTelemetry, and Jaeger.",
      "Define Service Level Objectives (SLOs) and lead blameless post-mortem incident response reviews."
    ],
    "coreTechnologies": [
      "Kubernetes (K8s)",
      "Docker",
      "GitHub Actions / GitLab CI",
      "Terraform",
      "Prometheus & Grafana",
      "ArgoCD (GitOps)",
      "Linux / Bash",
      "Helm"
    ],
    "prerequisites": [
      "Linux system fundamentals",
      "Containerization concepts (Docker)",
      "Basic cloud infrastructure knowledge"
    ],
    "relatedDomains": [
      "cloud-computing-cloud-engineering",
      "backend-api-development",
      "it-infrastructure-systems-administration"
    ],
    "careerProgression": "Junior DevOps Engineer -> Site Reliability Engineer (SRE) -> Platform Architect -> VP of Infrastructure & Reliability",
    "sortOrder": 13
  },
  {
    "id": "networking-telecommunications",
    "name": "Networking & Telecommunications",
    "family": "Cloud Computing, DevOps & Platform Engineering",
    "icon": "Network",
    "shortDescription": "Designing, configuring, and maintaining enterprise IP networks, routing protocols, firewalls, SD-WAN, and telecommunication carriers.",
    "overview": "Networking & Telecommunications underpins all global digital communication. Network engineers configure high-speed routers, BGP/OSPF protocol routing, switches, VPN tunnels, wireless mesh access points, and software-defined WANs (SD-WAN).",
    "whatProfessionalsDo": [
      "Design, configure, and troubleshoot enterprise LAN, WAN, WLAN, and campus backbone networks.",
      "Implement dynamic routing protocols including BGP, OSPF, and MPLS traffic engineering.",
      "Manage next-generation firewalls (Palo Alto, Cisco, Fortinet), IPsec VPN tunnels, and NAT policies.",
      "Analyze network packet captures using Wireshark to diagnose latency, packet drops, and MTU issues."
    ],
    "coreTechnologies": [
      "Cisco IOS / NX-OS",
      "BGP & OSPF",
      "Wireshark",
      "Palo Alto / Fortinet Firewalls",
      "SD-WAN",
      "TCP/IP, DNS, DHCP",
      "Linux Networking",
      "Python (Netmiko)"
    ],
    "prerequisites": [
      "OSI 7-layer model and TCP/IP protocol stack",
      "Subnetting and IPv4/IPv6 addressing",
      "Basic network hardware understanding"
    ],
    "relatedDomains": [
      "cybersecurity-information-security",
      "it-infrastructure-systems-administration",
      "cloud-computing-cloud-engineering"
    ],
    "careerProgression": "Network Support Specialist -> Network Engineer -> Senior Network Security Architect -> Director of Global Telecommunications",
    "sortOrder": 14
  },
  {
    "id": "it-infrastructure-systems-administration",
    "name": "IT Infrastructure & Systems Administration",
    "family": "Cloud Computing, DevOps & Platform Engineering",
    "icon": "MonitorSmartphone",
    "shortDescription": "Managing enterprise servers, Windows Active Directory, Linux distributions, virtualization hypervisors, and data center operations.",
    "overview": "Systems Administrators manage the core hardware, operating systems, virtualization servers, identity directories, and storage arrays that keep an organization operational day in and day out.",
    "whatProfessionalsDo": [
      "Deploy, patch, and administer Windows Server and Linux (RHEL, Ubuntu) operating system fleets.",
      "Configure enterprise identity services, Active Directory, Azure AD / Entra ID, GPOs, and LDAP authentication.",
      "Manage virtualization clusters using VMware vSphere, ESXi, Proxmox, and Hyper-V hypervisors.",
      "Administer enterprise SAN/NAS storage arrays, RAID configurations, and disaster recovery backup systems."
    ],
    "coreTechnologies": [
      "Windows Server & Active Directory",
      "Linux (RHEL, Ubuntu)",
      "VMware vSphere / ESXi",
      "PowerShell & Bash Scripting",
      "Ansible",
      "Azure AD (Entra ID)",
      "SAN/NAS Storage"
    ],
    "prerequisites": [
      "Computer hardware and peripheral understanding",
      "Operating system install and administration concepts",
      "Basic networking"
    ],
    "relatedDomains": [
      "networking-telecommunications",
      "it-support-it-service-management",
      "cybersecurity-information-security"
    ],
    "careerProgression": "Systems Support Specialist -> Systems Administrator (SysAdmin) -> Infrastructure Engineer -> IT Operations Director",
    "sortOrder": 15
  },
  {
    "id": "cybersecurity-information-security",
    "name": "Cybersecurity & Information Security",
    "family": "Cybersecurity, Information Assurance & Digital Trust",
    "icon": "ShieldCheck",
    "shortDescription": "Defending organizations from digital attacks, monitoring Security Operations Centers (SOC), and enforcing security controls.",
    "overview": "Cybersecurity & InfoSec encompasses the proactive defense of computing networks, data, and users. Security analysts monitor SIEM platforms for anomalous behavior, assess threat vulnerabilities, and enforce least-privilege security postures.",
    "whatProfessionalsDo": [
      "Monitor Security Operations Center (SOC) dashboards and triage alerts using SIEM tools (Splunk, Sentinel).",
      "Perform vulnerability assessments, scans, and remediation verification across networks and endpoints.",
      "Develop security policies, incident response runbooks, and multi-factor authentication (MFA) enforcement.",
      "Conduct phishing simulations and organizational employee security awareness training."
    ],
    "coreTechnologies": [
      "SIEM (Splunk, Microsoft Sentinel)",
      "Wireshark & Snort",
      "Nessus & Qualys",
      "EDR (CrowdStrike, Defender)",
      "Linux Security",
      "Python for Security",
      "Firewalls"
    ],
    "prerequisites": [
      "Networking fundamentals (TCP/IP, ports, DNS)",
      "Operating systems security (Linux & Windows)",
      "Basic understanding of threat vectors"
    ],
    "relatedDomains": [
      "ethical-hacking-offensive-security",
      "digital-forensics-incident-response-governance",
      "it-governance-risk-it-leadership"
    ],
    "careerProgression": "SOC Analyst (Tier 1) -> Information Security Engineer -> Security Architect -> Chief Information Security Officer (CISO)",
    "sortOrder": 16
  },
  {
    "id": "ethical-hacking-offensive-security",
    "name": "Ethical Hacking & Offensive Security",
    "family": "Cybersecurity, Information Assurance & Digital Trust",
    "icon": "KeyRound",
    "shortDescription": "Simulating sophisticated adversary attacks through penetration testing, exploit development, red teaming, and code auditing.",
    "overview": "Offensive Security specialists and ethical hackers rigorously probe applications and networks to discover vulnerabilities before malicious adversaries exploit them. They perform web penetration testing, network infiltration, and source code audits.",
    "whatProfessionalsDo": [
      "Conduct authorized black-box, grey-box, and white-box penetration tests across web, mobile, and APIs.",
      "Exploit OWASP Top 10 vulnerabilities (SQLi, XSS, SSRF, IDOR, auth bypass) and write proof-of-concept exploits.",
      "Perform simulated Red Team adversary operations, evasion of EDR solutions, and privilege escalation.",
      "Produce comprehensive vulnerability reports with cvss severity ratings and actionable remediation guidance."
    ],
    "coreTechnologies": [
      "Kali Linux",
      "Burp Suite Professional",
      "Metasploit",
      "Nmap",
      "Python & Bash Exploit Scripting",
      "GDB & Ghidra",
      "OWASP ZAP"
    ],
    "prerequisites": [
      "Deep web application architecture knowledge",
      "Networking and TCP/IP protocol mastery",
      "Familiarity with scripting (Python, Bash)"
    ],
    "relatedDomains": [
      "cybersecurity-information-security",
      "software-testing-quality-assurance",
      "digital-forensics-incident-response-governance"
    ],
    "careerProgression": "Junior Penetration Tester -> Ethical Hacker / Red Team Operator -> Principal Exploit Researcher -> Head of Offensive Security",
    "sortOrder": 17
  },
  {
    "id": "digital-forensics-incident-response-governance",
    "name": "Digital Forensics, Incident Response & Governance",
    "family": "Cybersecurity, Information Assurance & Digital Trust",
    "icon": "SearchCheck",
    "shortDescription": "Investigating cybercrime breaches, extracting digital evidence, reverse engineering malware, and containing live ransomware incidents.",
    "overview": "Digital Forensics and Incident Response (DFIR) specialists act as cyber emergency first responders and investigators. They analyze memory dumps, disk images, network packet logs, and malware payloads to uncover attack vectors and assist legal remediation.",
    "whatProfessionalsDo": [
      "Acquire forensically sound disk images and RAM memory dumps adhering to chain-of-custody protocols.",
      "Investigate live security breaches, identify patient-zero infection vectors, and contain malware lateral movement.",
      "Disassemble and reverse engineer malicious binaries and ransomware scripts in isolated sandboxes.",
      "Prepare authoritative technical forensic reports for executive leadership, insurers, and law enforcement."
    ],
    "coreTechnologies": [
      "Autopsy & EnCase",
      "Volatility (Memory Forensics)",
      "Wireshark",
      "Ghidra & IDA Pro",
      "YARA Rules",
      "FTK Imager",
      "Sysinternals Suite"
    ],
    "prerequisites": [
      "Deep Windows and Linux file system knowledge",
      "Operating systems internal mechanics (kernel, registry, process memory)",
      "Network packet analysis"
    ],
    "relatedDomains": [
      "cybersecurity-information-security",
      "ethical-hacking-offensive-security",
      "it-governance-risk-it-leadership"
    ],
    "careerProgression": "DFIR Associate -> Digital Forensics Investigator -> Incident Response Lead -> Cyber Crisis Commander",
    "sortOrder": 18
  },
  {
    "id": "software-testing-quality-assurance",
    "name": "Software Testing & Quality Assurance",
    "family": "Product Management, UI/UX & Quality Engineering",
    "icon": "CheckSquare",
    "shortDescription": "Designing automated test suites, performance benchmark stress testing, end-to-end user journey validation, and CI test pipelines.",
    "overview": "QA & Test Engineering ensures that software products meet functional, performance, accessibility, and security specifications. Software Development Engineers in Test (SDETs) write programmatic test automation frameworks ensuring high release velocity.",
    "whatProfessionalsDo": [
      "Architect robust end-to-end and API automated test suites using Playwright, Cypress, Selenium, and Postman.",
      "Conduct load, stress, and spike performance benchmarking using k6, JMeter, or Gatling.",
      "Integrate automated regression testing gates directly into CI/CD build deployment pipelines.",
      "Document detailed reproducible bug tickets and collaborate with development teams for resolution."
    ],
    "coreTechnologies": [
      "Playwright",
      "Cypress",
      "Selenium WebDriver",
      "Postman / Newman",
      "k6 & Apache JMeter",
      "Jest / Vitest",
      "Python & TypeScript",
      "Jenkins / GitHub Actions"
    ],
    "prerequisites": [
      "Programming fundamentals (JavaScript/TypeScript or Python or Java)",
      "Software development lifecycle (SDLC) knowledge",
      "Basic web & API concepts"
    ],
    "relatedDomains": [
      "web-development-frontend-engineering",
      "backend-api-development",
      "devops-platform-engineering-sre"
    ],
    "careerProgression": "QA Test Analyst -> Software Development Engineer in Test (SDET) -> Lead QA Architect -> VP of Quality Engineering",
    "sortOrder": 19
  },
  {
    "id": "it-support-it-service-management",
    "name": "IT Support & IT Service Management",
    "family": "Cloud Computing, DevOps & Platform Engineering",
    "icon": "Headphones",
    "shortDescription": "Delivering technical support resolution, ITIL incident management, hardware endpoint provisioning, and user desktop assistance.",
    "overview": "IT Support & Service Management (ITSM) provides the vital technical assistance and device management that empowers modern employees. Following ITIL best practices, support specialists triage tickets, configure laptops, and diagnose software/hardware issues.",
    "whatProfessionalsDo": [
      "Triage, troubleshoot, and resolve hardware, software, VPN, and account access issues across Windows and macOS.",
      "Manage endpoint fleet provisioning using Mobile Device Management (MDM) tools (Intune, Jamf).",
      "Follow ITIL service frameworks for Incident, Problem, Change, and Asset Management.",
      "Author user-friendly knowledge base documentation and self-service troubleshooting guides."
    ],
    "coreTechnologies": [
      "ServiceNow & Jira Service Desk",
      "Microsoft Intune & Jamf",
      "Windows 11 & macOS",
      "Active Directory & Okta",
      "Remote Support Tools",
      "PowerShell"
    ],
    "prerequisites": [
      "Hardware troubleshooting and OS fundamentals",
      "Empathy, active listening, and customer communication",
      "Basic networking principles"
    ],
    "relatedDomains": [
      "it-infrastructure-systems-administration",
      "networking-telecommunications",
      "technical-writing-developer-experience"
    ],
    "careerProgression": "Helpdesk Technician -> IT Support Specialist -> ITSM Service Delivery Lead -> IT Operations Manager",
    "sortOrder": 20
  },
  {
    "id": "ui-ux-product-design",
    "name": "UI/UX & Product Design",
    "family": "Product Management, UI/UX & Quality Engineering",
    "icon": "Palette",
    "shortDescription": "Conducting human-centered user research, crafting interactive prototypes in Figma, establishing design systems, and visual ergonomics.",
    "overview": "UI/UX & Product Design focuses on how users interact with and experience software. Designers conduct user interviews, build low-fidelity wireframes, architect comprehensive design component tokens, and validate workflows with usability testing.",
    "whatProfessionalsDo": [
      "Conduct qualitative and quantitative user research, user journey mapping, and empathy interviews.",
      "Design comprehensive, tokenized design systems and responsive component libraries in Figma.",
      "Build interactive clickable prototypes for usability testing, stakeholder reviews, and dev handoffs.",
      "Ensure accessibility adherence according to Web Content Accessibility Guidelines (WCAG 2.1 AA)."
    ],
    "coreTechnologies": [
      "Figma",
      "FigJam / Miro",
      "Design Tokens & CSS Pairing",
      "Usability Testing & Hotjar",
      "Wireframing & Prototyping",
      "WCAG Accessibility Standards"
    ],
    "prerequisites": [
      "Visual design principles (typography, color theory, spacing, visual hierarchy)",
      "Empathy for human behavior",
      "Curiosity about digital usability"
    ],
    "relatedDomains": [
      "web-development-frontend-engineering",
      "product-management-business-analysis",
      "technical-writing-developer-experience"
    ],
    "careerProgression": "Junior UI/UX Designer -> Product Designer -> Lead UX Researcher / Design Architect -> VP of Product Design",
    "sortOrder": 21
  },
  {
    "id": "product-management-business-analysis",
    "name": "Product Management & Business Analysis",
    "family": "Product Management, UI/UX & Quality Engineering",
    "icon": "Compass",
    "shortDescription": "Defining product strategy, authoring Product Requirement Documents (PRDs), leading agile scrums, and bridging customer needs with tech.",
    "overview": "Product Managers and Business Analysts chart the course for what engineering builds. They analyze customer requirements, prioritize features, write Product Requirement Documents (PRDs), lead sprint ceremonies, and measure product-market success.",
    "whatProfessionalsDo": [
      "Formulate comprehensive product roadmaps aligned with business targets and user discovery.",
      "Author detailed Product Requirement Documents (PRDs), user stories, and acceptance criteria.",
      "Facilitate agile sprint planning, backlog grooming, and cross-functional engineering check-ins.",
      "Analyze product engagement telemetry (Mixpanel, Amplitude, Google Analytics) to guide roadmap decisions."
    ],
    "coreTechnologies": [
      "Jira & Confluence",
      "Mixpanel & Amplitude",
      "Product Analytics (SQL)",
      "Figma (Inspection)",
      "Roadmapping Tools",
      "Agile / Scrum Methodologies"
    ],
    "prerequisites": [
      "Communication and stakeholder management",
      "Understanding of software development lifecycles",
      "Analytical mindset and business acumen"
    ],
    "relatedDomains": [
      "ui-ux-product-design",
      "it-project-program-delivery-management",
      "data-analytics-business-intelligence"
    ],
    "careerProgression": "Associate Product Manager (APM) -> Technical Product Manager (TPM) -> Group Product Manager -> Chief Product Officer (CPO)",
    "sortOrder": 22
  },
  {
    "id": "systems-architecture-enterprise-integration",
    "name": "Systems Architecture & Enterprise Integration",
    "family": "Product Management, UI/UX & Quality Engineering",
    "icon": "Network",
    "shortDescription": "Designing overarching enterprise IT blueprints, service-oriented architectures (SOA), event streaming meshes, and middleware integrations.",
    "overview": "Enterprise and Systems Architects guide the strategic technology landscape of organizations. They design multi-tier application integrations, establish enterprise architecture frameworks (TOGAF), and ensure long-term architectural coherence.",
    "whatProfessionalsDo": [
      "Architect enterprise-wide integration patterns connecting legacy on-prem systems with modern cloud SaaS.",
      "Design asynchronous event-driven integration fabrics using Apache Kafka, RabbitMQ, and MuleSoft.",
      "Establish technical governance standards, architecture decision records (ADRs), and technology radar.",
      "Evaluate third-party vendor platforms, perform technical due diligence, and mitigate architectural risks."
    ],
    "coreTechnologies": [
      "TOGAF & C4 Modeling",
      "MuleSoft / Apache Camel",
      "Apache Kafka / Event Mesh",
      "Microservices Architecture",
      "Cloud Architecture (AWS/Azure)",
      "UML & System Diagrams"
    ],
    "prerequisites": [
      "Extensive software engineering experience across frontend, backend, and databases",
      "Deep understanding of distributed systems design",
      "Executive communication skills"
    ],
    "relatedDomains": [
      "backend-api-development",
      "cloud-computing-cloud-engineering",
      "enterprise-applications-erp-crm"
    ],
    "careerProgression": "Senior Software Engineer -> Solutions Architect -> Enterprise Architect -> Chief Technology Officer (CTO)",
    "sortOrder": 23
  },
  {
    "id": "enterprise-applications-erp-crm",
    "name": "Enterprise Applications, ERP & CRM",
    "family": "Enterprise Business Systems & Process Automation",
    "icon": "Building2",
    "shortDescription": "Customizing, deploying, and integrating core commercial enterprise platforms such as SAP S/4HANA, Salesforce CRM, and Oracle Cloud.",
    "overview": "Enterprise Applications Specialists customize and integrate the massive operational software suites that power Fortune 500 corporations, including SAP ERP systems, Salesforce Customer 360, Oracle Financials, and Workday HR platforms.",
    "whatProfessionalsDo": [
      "Configure and customize SAP modules (FICO, SD, MM) or Salesforce platforms (Apex, Lightning Web Components).",
      "Develop bidirectional integration connectors between ERP/CRM backends and external proprietary databases.",
      "Map complex enterprise business processes into standardized automated workflow engines.",
      "Lead large-scale enterprise data migrations, system cutovers, and user acceptance testing (UAT)."
    ],
    "coreTechnologies": [
      "SAP S/4HANA & ABAP",
      "Salesforce & Apex / LWC",
      "Oracle Cloud ERP",
      "Workday HCM",
      "Microsoft Dynamics 365",
      "SOAP / REST Web Services",
      "SQL"
    ],
    "prerequisites": [
      "Understanding of fundamental business processes (order-to-cash, procure-to-pay)",
      "Relational database concepts",
      "Basic object-oriented programming"
    ],
    "relatedDomains": [
      "systems-architecture-enterprise-integration",
      "technology-consulting-technical-solutions",
      "database-data-platform-administration"
    ],
    "careerProgression": "Junior ERP/CRM Developer -> Functional / Technical Consultant -> Lead Enterprise Systems Architect -> VP of Enterprise Applications",
    "sortOrder": 24
  },
  {
    "id": "it-project-program-delivery-management",
    "name": "IT Project, Program & Delivery Management",
    "family": "Product Management, UI/UX & Quality Engineering",
    "icon": "CalendarClock",
    "shortDescription": "Leading complex digital transformations, managing budgets, timeline schedules, risk registers, and technical agile cross-functional delivery.",
    "overview": "IT Project and Program Managers oversee technical delivery from inception to rollout. They orchestrate cross-functional engineering squads, resolve scope bottlenecks, manage budgets, track project risks, and ensure on-time delivery.",
    "whatProfessionalsDo": [
      "Lead technical project execution plans, milestones, critical path schedules, and resource allocations.",
      "Facilitate Agile/Scrum ceremonies, sprint velocity estimations, burn-down tracking, and retrospective reviews.",
      "Manage technical risks, change-management requests, dependency matrices, and vendor deliverables.",
      "Report status dashboards, financial burn rates, and project health metrics to executive steering committees."
    ],
    "coreTechnologies": [
      "Jira Software & Advanced Roadmaps",
      "Microsoft Project / Asana",
      "Agile / Scrum / Kanban Frameworks",
      "Risk & RAID Logs",
      "Confluence",
      "PMP / PRINCE2 Methodologies"
    ],
    "prerequisites": [
      "Strong leadership, conflict resolution, and communication abilities",
      "Familiarity with software delivery stages",
      "Organizational planning skills"
    ],
    "relatedDomains": [
      "product-management-business-analysis",
      "technology-consulting-technical-solutions",
      "it-governance-risk-it-leadership"
    ],
    "careerProgression": "Project Coordinator -> IT Project Manager (PMP) -> Technical Program Manager (TPM) -> Director of Project Management Office (PMO)",
    "sortOrder": 25
  },
  {
    "id": "robotics-iot-industrial-automation",
    "name": "Robotics, IoT & Industrial Automation",
    "family": "Specialized & Deep Tech Engineering",
    "icon": "Bot",
    "shortDescription": "Programming autonomous robotic systems, smart sensor telemetry, industrial PLC controllers, and edge edge-computing pipelines.",
    "overview": "Robotics, IoT & Industrial Automation merges software engineering with physical machinery. Engineers write robotic operating systems (ROS), ingest telemetry from smart edge sensors over MQTT, and control automated factory lines.",
    "whatProfessionalsDo": [
      "Program autonomous mobile robots (AMRs) using ROS / ROS2, SLAM algorithms, and trajectory path planners.",
      "Develop embedded IoT edge sensor telemetry firmware communicating over MQTT, LoRaWAN, and BLE.",
      "Configure Programmable Logic Controllers (PLCs), SCADA monitoring systems, and industrial fieldbuses.",
      "Implement edge computer vision and predictive maintenance machine learning algorithms on NVIDIA Jetson chips."
    ],
    "coreTechnologies": [
      "Robot Operating System (ROS / ROS2)",
      "C++ & Python",
      "MQTT & CoAP Protocols",
      "Raspberry Pi & NVIDIA Jetson",
      "PLC Programming (Ladder Logic / Structured Text)",
      "OpenCV & SLAM",
      "Arduino / ESP32"
    ],
    "prerequisites": [
      "Proficiency in C++ or Python",
      "Basic electronics, sensors, and actuators",
      "Linear algebra and physics kinematics"
    ],
    "relatedDomains": [
      "desktop-systems-embedded-software",
      "hardware-semiconductor-computer-engineering",
      "artificial-intelligence-machine-learning"
    ],
    "careerProgression": "Robotics Software Intern -> Robotics / IoT Engineer -> Lead Automation Architect -> Head of Robotics Engineering",
    "sortOrder": 26
  },
  {
    "id": "game-development-graphics-xr",
    "name": "Game Development, Graphics & XR",
    "family": "Software, Systems & Web Engineering",
    "icon": "Gamepad2",
    "shortDescription": "Engineering immersive real-time 3D game engines, shader pipelines, spatial audio, virtual reality (VR), and augmented reality (AR).",
    "overview": "Game Development, Graphics & Extended Reality (XR) creates interactive real-time visual worlds. Developers write game loop physics, custom GPU vertex and fragment shaders, and spatial computing experiences for VR/AR headsets.",
    "whatProfessionalsDo": [
      "Develop interactive gameplay mechanics, physics controllers, and AI pathfinding in Unity (C#) or Unreal Engine (C++).",
      "Write custom GPU shader code using HLSL, GLSL, and graphics APIs (Vulkan, DirectX 12, Metal).",
      "Build immersive spatial computing applications for Apple Vision Pro, Meta Quest, and mobile AR (ARKit/ARCore).",
      "Optimize 3D draw calls, texture atlas memory budgets, LOD systems, and real-time frame rates (90fps+)."
    ],
    "coreTechnologies": [
      "Unreal Engine 5 (C++ & Blueprints)",
      "Unity (C#)",
      "GLSL / HLSL Shaders",
      "Vulkan & OpenGL",
      "OpenXR & WebXR",
      "Blender / 3D Math",
      "Spatial Audio"
    ],
    "prerequisites": [
      "Strong C++ or C# programming",
      "Solid 3D mathematics (vectors, matrices, quaternions, dot/cross products)",
      "Passion for interactive mechanics"
    ],
    "relatedDomains": [
      "ui-ux-product-design",
      "desktop-systems-embedded-software",
      "mobile-application-development"
    ],
    "careerProgression": "Junior Game Programmer -> Gameplay / Graphics Engineer -> Lead XR Architect -> Technical Director (Games/VFX)",
    "sortOrder": 27
  },
  {
    "id": "blockchain-web3",
    "name": "Blockchain & Web3",
    "family": "Specialized & Deep Tech Engineering",
    "icon": "Coins",
    "shortDescription": "Developing decentralized applications (dApps), Solidity smart contracts, consensus protocols, and zero-knowledge cryptography.",
    "overview": "Blockchain & Web3 centers on decentralized peer-to-peer computing, cryptographic verification, and programmable value exchange. Engineers build immutable smart contracts, decentralized finance (DeFi) protocols, and token standards.",
    "whatProfessionalsDo": [
      "Write, test, and security-audit EVM-compatible smart contracts using Solidity and Hardhat/Foundry.",
      "Develop decentralized frontend applications (dApps) integrating Web3.js, Ethers.js, and crypto wallet providers.",
      "Implement Layer-2 scaling solutions, zero-knowledge proofs (zk-SNARKs), and cross-chain bridge mechanisms.",
      "Perform smart contract vulnerability audits against reentrancy attacks, integer overflows, and front-running."
    ],
    "coreTechnologies": [
      "Solidity",
      "Rust (Solana / Substrate)",
      "Ethers.js / Web3.js",
      "Hardhat & Foundry",
      "EVM Architecture",
      "Zero-Knowledge Proofs",
      "IPFS"
    ],
    "prerequisites": [
      "Proficiency in JavaScript/TypeScript or Python",
      "Cryptography fundamentals (hashes, public/private keys, digital signatures)",
      "Data structures (Merkle trees)"
    ],
    "relatedDomains": [
      "backend-api-development",
      "cybersecurity-information-security",
      "fintech-financial-technology"
    ],
    "careerProgression": "Junior Smart Contract Developer -> Blockchain Protocol Engineer -> Smart Contract Security Auditor -> Web3 Chief Architect",
    "sortOrder": 28
  },
  {
    "id": "hardware-semiconductor-computer-engineering",
    "name": "Hardware, Semiconductor & Computer Engineering",
    "family": "Specialized & Deep Tech Engineering",
    "icon": "Microchip",
    "shortDescription": "Designing microchips, VLSI circuits, FPGA accelerators, custom silicon, computer architectures, and PCB printed circuit boards.",
    "overview": "Hardware & Semiconductor Engineering focuses on the physical silicon that executes all software. Engineers design application-specific integrated circuits (ASICs), write Verilog/VHDL for FPGAs, and design high-speed printed circuit boards.",
    "whatProfessionalsDo": [
      "Design and verify digital logic hardware modules using SystemVerilog, Verilog, and VHDL.",
      "Perform FPGA synthesis, timing closure, place-and-route, and simulation verification (ModelSim, Vivado).",
      "Design multi-layer high-speed printed circuit boards (PCBs) with impedance matching and EMI shielding in KiCad/Altium.",
      "Validate physical silicon prototypes in hardware test labs using high-frequency oscilloscopes and logic analyzers."
    ],
    "coreTechnologies": [
      "SystemVerilog & Verilog",
      "VHDL",
      "FPGA (Xilinx / Altera)",
      "EDA Tools (Synopsys, Cadence)",
      "Altium Designer & KiCad",
      "Computer Architecture (RISC-V, ARM)",
      "C / Assembly"
    ],
    "prerequisites": [
      "Digital logic and boolean algebra",
      "Computer architecture and microprocessors",
      "Circuit analysis fundamentals"
    ],
    "relatedDomains": [
      "desktop-systems-embedded-software",
      "robotics-iot-industrial-automation",
      "research-computing-scientific-technology"
    ],
    "careerProgression": "VLSI Design Associate -> Silicon Design / Verification Engineer -> Principal ASIC Architect -> VP of Silicon Engineering",
    "sortOrder": 29
  },
  {
    "id": "mlops-ai-infrastructure-responsible-ai",
    "name": "MLOps, AI Infrastructure & Responsible AI",
    "family": "Artificial Intelligence, GenAI & Autonomous Systems",
    "icon": "Gauge",
    "shortDescription": "Industrializing machine learning pipelines, GPU cluster scheduling, model registry governance, inference serving, and ethical AI auditing.",
    "overview": "MLOps & AI Infrastructure engineers build the production machinery needed to run AI models reliably at scale. They orchestrate distributed GPU training clusters, implement automated retraining triggers, monitor model drift, and audit fairness.",
    "whatProfessionalsDo": [
      "Deploy high-throughput, low-latency model inference servers using Triton, vLLM, and TorchServe.",
      "Build automated continuous ML training pipelines using Kubeflow, MLflow, and Weights & Biases.",
      "Manage high-density GPU computing clusters with Kubernetes, Ray, and Slurm schedulers.",
      "Implement real-time model monitoring for data drift, concept drift, feature skew, and algorithmic bias."
    ],
    "coreTechnologies": [
      "Kubeflow & MLflow",
      "Docker & Kubernetes",
      "Triton Inference Server",
      "Ray & Slurm",
      "Weights & Biases",
      "Python",
      "CUDA / GPU Orchestration",
      "Evidently AI"
    ],
    "prerequisites": [
      "Machine learning fundamentals",
      "DevOps and containerization (Docker, Kubernetes)",
      "Python software engineering"
    ],
    "relatedDomains": [
      "artificial-intelligence-machine-learning",
      "generative-ai-llm-engineering",
      "devops-platform-engineering-sre"
    ],
    "careerProgression": "Junior MLOps Engineer -> AI Infrastructure Engineer -> Lead MLOps Architect -> Head of AI Operations",
    "sortOrder": 30
  },
  {
    "id": "research-computing-scientific-technology",
    "name": "Research Computing & Scientific Technology",
    "family": "Specialized & Deep Tech Engineering",
    "icon": "FlaskConical",
    "shortDescription": "Harnessing supercomputing clusters, high-performance computing (HPC), quantum computing algorithms, and computational simulations.",
    "overview": "Research Computing develops computational software for scientific discovery, from climate modeling and molecular dynamics to quantum algorithms. Engineers write highly parallelized code running across thousands of supercomputing cores.",
    "whatProfessionalsDo": [
      "Parallelize scientific simulation algorithms using MPI, OpenMP, and multi-GPU CUDA programming.",
      "Administer petascale high-performance computing (HPC) clusters, parallel file systems (Lustre), and Slurm schedulers.",
      "Develop quantum computing circuits and hybrid quantum-classical algorithms using Qiskit or Cirq.",
      "Collaborate with physicists, chemists, and bioinformaticians to optimize computational bottlenecks."
    ],
    "coreTechnologies": [
      "MPI (Message Passing Interface)",
      "OpenMP & CUDA",
      "C / C++ & Fortran",
      "Python / NumPy",
      "Slurm & PBS Schedulers",
      "Qiskit (Quantum Computing)",
      "Lustre File System"
    ],
    "prerequisites": [
      "Strong mathematics and scientific fundamentals",
      "Parallel computing theory",
      "High proficiency in C, C++, or Fortran"
    ],
    "relatedDomains": [
      "artificial-intelligence-machine-learning",
      "hardware-semiconductor-computer-engineering",
      "healthtech-medical-informatics"
    ],
    "careerProgression": "HPC Research Assistant -> Scientific Computing Specialist -> Supercomputing Architect -> Director of National Research Computing",
    "sortOrder": 31
  },
  {
    "id": "technology-consulting-technical-solutions",
    "name": "Technology Consulting & Technical Solutions",
    "family": "Enterprise Business Systems & Process Automation",
    "icon": "Briefcase",
    "shortDescription": "Advising corporate clients on digital transformation strategies, presales technical architecture, and complex vendor migrations.",
    "overview": "Technology Consultants and Solutions Engineers act as strategic technical advisors. They evaluate enterprise IT architectures, design migration roadmaps, conduct proofs-of-concept (PoCs), and bridge technical solutions with executive business strategy.",
    "whatProfessionalsDo": [
      "Assess client enterprise architectures, identify operational bottlenecks, and formulate digital transformation strategies.",
      "Deliver technical presales demonstrations, architectural proofs-of-concept (PoCs), and RFPs.",
      "Guide executive leadership through cloud migrations, legacy modernizations, and technical change management.",
      "Perform cost-benefit analyses, total cost of ownership (TCO) assessments, and ROI projections."
    ],
    "coreTechnologies": [
      "Enterprise Architecture Frameworks",
      "Cloud Migration Strategies (AWS/Azure)",
      "Executive Presentation & Storytelling",
      "Technical RFPs & SOWs",
      "Solution Prototyping",
      "Business Process Modeling"
    ],
    "prerequisites": [
      "Broad technical literacy across software, cloud, and data",
      "Exceptional verbal and written communication",
      "Commercial awareness and business problem solving"
    ],
    "relatedDomains": [
      "systems-architecture-enterprise-integration",
      "enterprise-applications-erp-crm",
      "it-project-program-delivery-management"
    ],
    "careerProgression": "Associate Technology Consultant -> Solutions Consultant -> Senior Engagement Lead -> Partner / Managing Director",
    "sortOrder": 32
  },
  {
    "id": "fintech-financial-technology",
    "name": "FinTech & Financial Technology",
    "family": "Industry Domain Technology (FinTech, HealthTech, GIS, SpaceTech)",
    "icon": "CreditCard",
    "shortDescription": "Developing high-frequency trading platforms, secure payment gateways, core banking APIs, and automated fraud detection systems.",
    "overview": "FinTech combines software engineering with banking, wealth management, and payment rails. Engineers build ultra-low-latency order matching engines, secure payment processing gateways, fraud detection networks, and open-banking APIs.",
    "whatProfessionalsDo": [
      "Develop microsecond-latency trading execution engines and market data feeds using low-latency C++ and Java.",
      "Build PCI-DSS compliant payment processing integrations, card tokenization, and settlement pipelines.",
      "Implement real-time transaction fraud detection systems using graph databases and machine learning models.",
      "Ensure strict regulatory compliance with financial authorities (RBI, SEC, PSD2, Basel III)."
    ],
    "coreTechnologies": [
      "Low-Latency C++ / Java",
      "Kafka & Real-Time Messaging",
      "PostgreSQL & Distributed SQL",
      "PCI-DSS Compliance",
      "FIX Protocol (Trading)",
      "Python for Quant Finance",
      "Redis"
    ],
    "prerequisites": [
      "Strong programming rigor (concurrency, memory management)",
      "Understanding of basic finance and accounting principles",
      "Security and data integrity mindset"
    ],
    "relatedDomains": [
      "backend-api-development",
      "data-analytics-business-intelligence",
      "blockchain-web3",
      "cybersecurity-information-security"
    ],
    "careerProgression": "Junior FinTech Engineer -> Financial Systems Developer -> Senior Trading / Payment Architect -> Head of Financial Technology",
    "sortOrder": 33
  },
  {
    "id": "healthtech-medical-informatics",
    "name": "HealthTech & Medical Informatics",
    "family": "Industry Domain Technology (FinTech, HealthTech, GIS, SpaceTech)",
    "icon": "HeartPulse",
    "shortDescription": "Building HIPAA-compliant telemedicine platforms, electronic health record (EHR) integrations, medical imaging AI, and clinical software.",
    "overview": "HealthTech develops software that saves lives and optimizes patient care. Engineers build telehealth platforms, integrate with hospital Electronic Health Records (EHR) via HL7/FHIR protocols, and deploy diagnostic AI on medical scans.",
    "whatProfessionalsDo": [
      "Develop secure, HIPAA-compliant patient portals, telehealth video consultations, and remote monitoring tools.",
      "Implement standardized healthcare interoperability protocols using HL7 and FHIR standards.",
      "Build medical imaging analysis models (CT, MRI scans) adhering to DICOM standards and clinical safety validations.",
      "Maintain strict encryption, patient privacy controls, and medical device software regulations (FDA / CE)."
    ],
    "coreTechnologies": [
      "HL7 & FHIR Standards",
      "Python & PyTorch",
      "DICOM Imaging",
      "HIPAA & GDPR Compliance",
      "WebRTC for Telehealth",
      "PostgreSQL",
      "Secure Cloud Architectures"
    ],
    "prerequisites": [
      "Solid software engineering foundations",
      "Strong appreciation for data privacy, ethics, and patient safety",
      "Familiarity with medical data standards"
    ],
    "relatedDomains": [
      "artificial-intelligence-machine-learning",
      "full-stack-enterprise-software",
      "data-analytics-business-intelligence"
    ],
    "careerProgression": "Associate Healthcare Engineer -> Medical Informatics Developer -> Lead HealthTech Architect -> Chief Medical Information Officer (CMIO)",
    "sortOrder": 34
  },
  {
    "id": "gis-geospatial-location-technology",
    "name": "GIS, Geospatial & Location Technology",
    "family": "Industry Domain Technology (FinTech, HealthTech, GIS, SpaceTech)",
    "icon": "MapPin",
    "shortDescription": "Processing spatial vector data, interactive map tile rendering, satellite remote sensing, routing logistics, and location intelligence.",
    "overview": "Geospatial Information Systems (GIS) focuses on mapping, location analytics, and satellite remote sensing. Engineers develop map rendering tiles, optimize vehicle routing algorithms, and process petabytes of Earth observation imagery.",
    "whatProfessionalsDo": [
      "Write spatial database queries and spatial index optimizations using PostGIS and GeoJSON.",
      "Develop interactive client mapping applications using Mapbox GL JS, Leaflet, and OpenLayers.",
      "Analyze satellite and drone imagery using GDAL, QGIS, and computer vision remote sensing models.",
      "Optimize delivery logistics routing, geocoding engines, and spatial point-in-polygon queries."
    ],
    "coreTechnologies": [
      "PostGIS & PostgreSQL",
      "Mapbox GL / Leaflet",
      "GeoJSON & Shapefiles",
      "Python (GeoPandas, Shapely, Rasterio)",
      "QGIS & ArcGIS",
      "GDAL / OGR",
      "Tile Servers"
    ],
    "prerequisites": [
      "Relational databases and SQL",
      "Coordinate reference systems (lat/long, projections like EPSG:4326)",
      "JavaScript or Python programming"
    ],
    "relatedDomains": [
      "data-analytics-business-intelligence",
      "web-development-frontend-engineering",
      "data-engineering-big-data"
    ],
    "careerProgression": "GIS Analyst -> Geospatial Software Engineer -> Lead Spatial Data Architect -> Director of Location Intelligence",
    "sortOrder": 35
  },
  {
    "id": "technical-writing-developer-experience",
    "name": "Technical Writing & Developer Experience",
    "family": "Technical Education, Governance & Executive Leadership",
    "icon": "FileCode",
    "shortDescription": "Authoring developer API documentation, SDKs, quickstarts, technical whitepapers, and optimizing Developer Experience (DevEx).",
    "overview": "Technical Writing & Developer Experience (DevEx/DevRel) bridges engineering and developers. Professionals write comprehensive API documentation, sample code repositories, interactive tutorials, SDKs, and build vibrant developer communities.",
    "whatProfessionalsDo": [
      "Author accurate, comprehensive API references, tutorials, and architecture guides using Markdown and OpenAPI/Swagger.",
      "Develop client SDK libraries, demo code applications, and interactive sandbox environments.",
      "Gather friction feedback from developers to advocate for UI and API ergonomics improvements.",
      "Present technical deep dives at developer conferences, write engineering blogs, and produce documentation video walkthroughs."
    ],
    "coreTechnologies": [
      "Markdown & MDX",
      "OpenAPI / Swagger",
      "Git & GitHub Docs-as-Code",
      "Docusaurus / MkDocs",
      "Multiple Languages (Python, JS, Go)",
      "API Testing (Postman)"
    ],
    "prerequisites": [
      "Clear, engaging, and precise written communication in English",
      "Hands-on coding literacy to build and test developer code",
      "Curiosity for breaking down complex tech"
    ],
    "relatedDomains": [
      "web-development-frontend-engineering",
      "backend-api-development",
      "it-training-technical-education"
    ],
    "careerProgression": "Junior Technical Writer -> Developer Advocate -> Developer Experience Architect -> Head of Developer Relations (DevRel)",
    "sortOrder": 36
  },
  {
    "id": "it-training-technical-education",
    "name": "IT Training & Technical Education",
    "family": "Technical Education, Governance & Executive Leadership",
    "icon": "GraduationCap",
    "shortDescription": "Designing hands-on engineering bootcamps, technical curricula, interactive labs, coding assessments, and professional mentorship.",
    "overview": "Technical Educators and Corporate Trainers upskill the global software workforce. They design pedagogical curricula, build hands-on coding labs, conduct live bootcamp lectures, and mentor developers transition into high-impact tech careers.",
    "whatProfessionalsDo": [
      "Design comprehensive technical curricula covering programming languages, cloud systems, and system design.",
      "Deliver interactive technical lectures, live-coding workshops, and corporate training bootcamps.",
      "Construct automated coding exercises, project rubrics, and continuous assessment tests.",
      "Provide 1-on-1 career guidance, portfolio reviews, and mock technical interview evaluations."
    ],
    "coreTechnologies": [
      "Learning Management Systems (LMS)",
      "Interactive Code Sandboxes",
      "Curriculum Design & Instructional Pedagogy",
      "Git & GitHub Classrooms",
      "Python, JS, Java, Cloud",
      "Assessment Rubrics"
    ],
    "prerequisites": [
      "Deep technical domain competence",
      "Patience, empathy, and inspiring communication style",
      "Passion for helping students grow"
    ],
    "relatedDomains": [
      "technical-writing-developer-experience",
      "product-management-business-analysis",
      "it-governance-risk-it-leadership"
    ],
    "careerProgression": "Technical Mentor / Instructor -> Curriculum Architect -> Lead Technical Trainer -> Director of Engineering Enablement",
    "sortOrder": 37
  },
  {
    "id": "it-governance-risk-it-leadership",
    "name": "IT Governance, Risk & IT Leadership",
    "family": "Technical Education, Governance & Executive Leadership",
    "icon": "Award",
    "shortDescription": "Directing strategic enterprise IT alignment, regulatory compliance (ISO 27001, SOC 2), IT risk management, and CIO/CISO governance.",
    "overview": "IT Governance, Risk & Leadership aligns enterprise technology with statutory regulations, cybersecurity standards, and commercial vision. Leaders establish IT policies, oversee audits (SOC 2, ISO 27001, GDPR), and direct enterprise tech budgets.",
    "whatProfessionalsDo": [
      "Formulate organizational IT security policies, risk registers, and disaster recovery business continuity plans.",
      "Lead regulatory compliance audits (SOC 2 Type II, ISO 27001, HIPAA, PCI-DSS, GDPR).",
      "Manage enterprise technology budgets, vendor negotiations, IT staffing, and executive governance.",
      "Advise Board of Directors and C-suite on emerging cybersecurity threats, AI ethics, and digital risks."
    ],
    "coreTechnologies": [
      "COBIT & ITIL Frameworks",
      "ISO/IEC 27001 & SOC 2",
      "NIST Cybersecurity Framework",
      "Risk Assessment & GRC Tools",
      "IT Policy Formulation",
      "Executive Governance"
    ],
    "prerequisites": [
      "Deep enterprise IT lifecycle experience",
      "Comprehensive understanding of regulatory and legal standards",
      "Executive leadership and strategic decision-making"
    ],
    "relatedDomains": [
      "cybersecurity-information-security",
      "it-project-program-delivery-management",
      "systems-architecture-enterprise-integration"
    ],
    "careerProgression": "IT Compliance Specialist -> IT Risk Manager -> VP of IT Governance & Security -> Chief Information Officer (CIO) / CISO",
    "sortOrder": 38
  },
  {
    "id": "api-engineering-sdk-development",
    "name": "API Engineering & Developer Tooling",
    "family": "Software, Systems & Web Engineering",
    "icon": "Terminal",
    "shortDescription": "Designing, standardizing, and deploying high-performance public/private API platforms, developer SDKs, and CLI tools.",
    "overview": "API Engineering & Developer Tooling focuses on creating seamless integration surfaces for modern software ecosystems. Engineers build OpenAPI-compliant interfaces, multi-language client SDKs, developer CLI tooling, and resilient webhook infrastructures.",
    "whatProfessionalsDo": [
      "Design public and private API specifications using OpenAPI, Protocol Buffers, and GraphQL schemas.",
      "Generate, maintain, and publish idiomatic client SDKs across Python, TypeScript, Java, and Go.",
      "Implement API gateways with rate limiting, circuit breaking, dynamic routing, and token authorization.",
      "Engineer developer CLI tools and local testing mock emulators to accelerate developer onboarding."
    ],
    "coreTechnologies": [
      "OpenAPI 3.1",
      "gRPC & Protobuf",
      "Kong / Envoy",
      "TypeScript",
      "Go",
      "Python",
      "GraphQL",
      "Fern / Speakeasy SDK Generators"
    ],
    "prerequisites": [
      "Strong REST/HTTP protocol fundamentals",
      "Multi-language client development experience",
      "API versioning and breaking-change lifecycle understanding"
    ],
    "relatedDomains": [
      "backend-api-development",
      "full-stack-enterprise-software",
      "technical-writing-developer-experience"
    ],
    "careerProgression": "API Developer -> Senior API Platform Engineer -> Lead Developer Tools Architect -> Head of Developer Ecosystems",
    "sortOrder": 39
  },
  {
    "id": "software-release-build-engineering",
    "name": "Software Build, Release & Packaging Engineering",
    "family": "Software, Systems & Web Engineering",
    "icon": "Package",
    "shortDescription": "Orchestrating large-scale monorepo build acceleration, binary packaging, and release train pipelines.",
    "overview": "Build & Release Engineering optimizes software delivery cycles for massive distributed codebases. Specialists manage dependency graphs, caching compilers, automated release trains, and hermetic build systems.",
    "whatProfessionalsDo": [
      "Architect distributed build graphs using Bazel, Gradle Enterprise, Turborepo, or Nx.",
      "Manage software release trains, semantic versioning gates, and automated change-log auditing.",
      "Create reproducible, secure container images and signed binary artifacts (SBOMs).",
      "Optimize continuous integration cycle times through remote cache sharding and parallelized test runners."
    ],
    "coreTechnologies": [
      "Bazel",
      "Turborepo",
      "Docker",
      "Gradle",
      "GitHub Actions",
      "Cosign / SLSA",
      "Python",
      "Go",
      "Artifactory"
    ],
    "prerequisites": [
      "Compiler toolchains and dependency graph theory",
      "Continuous integration mechanics",
      "Container packaging standards"
    ],
    "relatedDomains": [
      "devops-platform-engineering-sre",
      "application-security-software-supply-chain",
      "backend-api-development"
    ],
    "careerProgression": "Build Engineer -> Release Automation Specialist -> Staff Build & Release Architect -> Director of Engineering Enablement",
    "sortOrder": 40
  },
  {
    "id": "data-governance-quality-observability",
    "name": "Data Governance, Quality & Observability",
    "family": "Data Science, Analytics & Big Data",
    "icon": "ShieldCheck",
    "shortDescription": "Ensuring enterprise data reliability, lineage transparency, statutory privacy compliance, and automated quality monitoring.",
    "overview": "Data Governance, Quality & Observability establishes trust and statutory compliance across enterprise data estates. Engineers build automated quality anomaly detectors, end-to-end data lineage DAGs, and metadata catalogs.",
    "whatProfessionalsDo": [
      "Implement automated data quality assertions and anomaly detection using Great Expectations and Monte Carlo.",
      "Deploy enterprise data catalogs (Atlan, Collibra) with automated column-level lineage tracking.",
      "Enforce regulatory privacy standards (GDPR, HIPAA, DPDP) with programmatic masking and retention policies.",
      "Establish Data SLAs, SLOs, and error budgets for business analytics and machine learning pipelines."
    ],
    "coreTechnologies": [
      "Monte Carlo",
      "Great Expectations",
      "Soda Core",
      "Atlan",
      "Collibra",
      "SQL",
      "Python",
      "dbt Test Suites",
      "Apache Atlas"
    ],
    "prerequisites": [
      "Data warehousing and ETL pipeline principles",
      "SQL and relational modeling",
      "Statutory data privacy regulatory awareness"
    ],
    "relatedDomains": [
      "data-engineering-big-data",
      "data-analytics-business-intelligence",
      "database-data-platform-administration"
    ],
    "careerProgression": "Data Quality Analyst -> Data Governance Engineer -> Data Reliability Architect -> Chief Data & Governance Officer",
    "sortOrder": 41
  },
  {
    "id": "knowledge-engineering-semantic-architecture",
    "name": "Knowledge Engineering & Semantic Architecture",
    "family": "Data Science, Analytics & Big Data",
    "icon": "Network",
    "shortDescription": "Designing enterprise knowledge graphs, graph RAG architectures, ontologies, and semantic relationship networks.",
    "overview": "Knowledge Engineering structures enterprise institutional intelligence into interconnected semantic graphs. Engineers link structured databases with unstructured corporate documents, powering Graph RAG and contextual AI retrieval.",
    "whatProfessionalsDo": [
      "Model domain ontologies, taxonomies, and property graphs using RDF, OWL, and Cypher.",
      "Construct knowledge graphs by extracting entities and relationships from enterprise data using NLP and LLMs.",
      "Engineer Graph RAG retrieval pipelines that combine vector similarity with graph traversal reasoning.",
      "Optimize distributed graph databases (Neo4j, Amazon Neptune) for low-latency graph analytics."
    ],
    "coreTechnologies": [
      "Neo4j & Cypher",
      "RDF / OWL",
      "SPARQL",
      "Amazon Neptune",
      "Python",
      "LangChain Graph RAG",
      "NetworkX",
      "Graphistry"
    ],
    "prerequisites": [
      "Graph data structures and relational theory",
      "Entity-relationship modeling",
      "Basic NLP and information extraction concepts"
    ],
    "relatedDomains": [
      "generative-ai-llm-engineering",
      "data-science-statistical-modeling",
      "data-engineering-big-data"
    ],
    "careerProgression": "Knowledge Analyst -> Knowledge Graph Engineer -> Principal Semantic Architect -> Chief Information Architect",
    "sortOrder": 42
  },
  {
    "id": "agentic-ai-autonomous-workflows",
    "name": "Agentic AI, Autonomous Workflows & AI Orchestration",
    "family": "Artificial Intelligence, GenAI & Autonomous Systems",
    "icon": "Bot",
    "shortDescription": "Architecting autonomous multi-agent systems, deterministic tool calling graphs, and self-directing AI execution swarms.",
    "overview": "Agentic AI represents the state of the art in artificial intelligence. Instead of static prompt-response interactions, engineers build autonomous agent graphs that formulate multi-step plans, invoke tools and APIs, handle errors dynamically, and collaborate in swarms.",
    "whatProfessionalsDo": [
      "Architect deterministic multi-agent state machines using LangGraph, CrewAI, AutoGen, and Semantic Kernel.",
      "Implement structured tool calling schemas, API execution connectors, and database query agents.",
      "Deploy multi-agent consensus protocols, supervisor-worker delegation, and human-in-the-loop checkpoints.",
      "Trace, debug, and benchmark agent task completion rates, hallucination loops, and token unit costs."
    ],
    "coreTechnologies": [
      "LangGraph",
      "CrewAI",
      "AutoGen",
      "Python (AsyncIO)",
      "Pydantic",
      "OpenAI / Anthropic Tool Calling",
      "LangSmith",
      "Arize Phoenix",
      "pgvector"
    ],
    "prerequisites": [
      "Advanced Python and asynchronous programming",
      "Deep understanding of LLM capabilities and function calling",
      "State machine design principles"
    ],
    "relatedDomains": [
      "generative-ai-llm-engineering",
      "artificial-intelligence-machine-learning",
      "mlops-ai-infrastructure-responsible-ai"
    ],
    "careerProgression": "AI Developer -> Autonomous AI Agent Engineer -> Multi-Agent Systems Architect -> Head of Agentic AI Engineering",
    "sortOrder": 43
  },
  {
    "id": "platform-engineering-internal-developer-platforms",
    "name": "Platform Engineering & Internal Developer Platforms",
    "family": "Cloud Computing, DevOps & Platform Engineering",
    "icon": "Layers",
    "shortDescription": "Building internal developer platforms (IDPs), self-service cloud infrastructure portals, and Golden Paths for engineering teams.",
    "overview": "Platform Engineering is the evolution of DevOps at enterprise scale. Rather than forcing software engineers to become cloud and infrastructure experts, platform engineers treat internal developers as customers, creating self-service portals (Backstage, Port) and automated Golden Paths.",
    "whatProfessionalsDo": [
      "Architect and deploy Internal Developer Portals (IDPs) using Spotify Backstage, Port, or Humanitec.",
      "Design Golden Path deployment templates that auto-provision databases, DNS, ingress, and CI/CD pipelines.",
      "Enforce infrastructure guardrails, role-based access, and compliance policies transparently in code.",
      "Measure developer velocity, DORA metrics, and Time to First Commit for engineering organizations."
    ],
    "coreTechnologies": [
      "Backstage (React/Node)",
      "Kubernetes",
      "Crossplane",
      "Terraform",
      "Helm",
      "ArgoCD",
      "Port",
      "Humanitec",
      "GitOps"
    ],
    "prerequisites": [
      "Advanced Kubernetes and cloud infrastructure mastery",
      "Infrastructure as Code and GitOps experience",
      "Developer experience (DevEx) empathy"
    ],
    "relatedDomains": [
      "devops-platform-engineering-sre",
      "cloud-computing-cloud-engineering",
      "technical-writing-developer-experience"
    ],
    "careerProgression": "DevOps Engineer -> Platform Engineer -> Staff Platform Architect -> VP of Core Platform Engineering",
    "sortOrder": 44
  },
  {
    "id": "cloud-finops-sustainable-infrastructure",
    "name": "Cloud FinOps & Sustainable Infrastructure",
    "family": "Cloud Computing, DevOps & Platform Engineering",
    "icon": "DollarSign",
    "shortDescription": "Directing multi-cloud financial operations, unit economics of compute, reservation optimizations, and green carbon reduction.",
    "overview": "Cloud FinOps brings financial accountability to the variable spend model of cloud computing. FinOps practitioners collaborate with engineering and finance leaders to optimize cloud unit costs, allocate charges transparently, and reduce carbon emissions.",
    "whatProfessionalsDo": [
      "Analyze multi-cloud billing streams across AWS, Azure, and GCP to identify waste, idle compute, and zombie resources.",
      "Model and execute commitment purchases (Savings Plans, Reserved Instances, Spot Fleets).",
      "Establish unit economic metrics (Cost per Active User, Cost per API Call) and tag governance.",
      "Track cloud carbon emissions and optimize datacenter region selection for sustainable green computing."
    ],
    "coreTechnologies": [
      "FinOps Framework",
      "AWS Cost Explorer / CUR",
      "Azure Cost Management",
      "CloudHealth",
      "Kubecost",
      "Terraform (Infracost)",
      "Python",
      "SQL"
    ],
    "prerequisites": [
      "Cloud architecture and pricing model mastery",
      "Financial budgeting and unit economics modeling",
      "SQL and data analysis skills"
    ],
    "relatedDomains": [
      "cloud-computing-cloud-engineering",
      "devops-platform-engineering-sre",
      "it-governance-risk-it-leadership"
    ],
    "careerProgression": "Cloud Analyst -> FinOps Certified Practitioner -> Director of Cloud Economics & FinOps -> Chief FinOps Officer",
    "sortOrder": 45
  },
  {
    "id": "identity-access-management-zero-trust",
    "name": "Identity & Access Management (IAM) & Zero Trust",
    "family": "Cybersecurity, Information Assurance & Digital Trust",
    "icon": "Key",
    "shortDescription": "Architecting identity governance, privileged access management (PAM), federated SSO, and continuous Zero Trust verification.",
    "overview": "Identity & Access Management (IAM) is the primary security boundary of modern hybrid and cloud enterprises. Engineers enforce Zero Trust principles (\"never trust, always verify\"), managing identity lifecycles, adaptive authentication, and privileged credentials.",
    "whatProfessionalsDo": [
      "Architect federated Single Sign-On (SSO) and Multi-Factor Authentication (MFA) using SAML 2.0, OIDC, and FIDO2/Passkeys.",
      "Implement Privileged Access Management (PAM) vaulting and just-in-time elevation using CyberArk or HashiCorp Vault.",
      "Deploy Identity Governance and Administration (IGA) platforms (SailPoint) for automated role-based lifecycle provisioning.",
      "Enforce continuous context-aware conditional access policies evaluating device health, IP reputation, and risk signals."
    ],
    "coreTechnologies": [
      "Okta / Microsoft Entra ID",
      "SailPoint",
      "CyberArk",
      "HashiCorp Vault",
      "SAML 2.0 & OIDC",
      "OAuth 2.0",
      "FIDO2 / WebAuthn",
      "SCIM"
    ],
    "prerequisites": [
      "Authentication protocols and public key cryptography",
      "Active Directory and directory services",
      "Zero Trust architectural concepts"
    ],
    "relatedDomains": [
      "cloud-security-cnapp-devsecops",
      "security-operations-soc-analysis",
      "it-governance-risk-it-leadership"
    ],
    "careerProgression": "IAM Engineer -> Identity Security Architect -> Director of Identity & Access Management -> Chief Identity Officer",
    "sortOrder": 46
  },
  {
    "id": "cloud-security-cnapp-devsecops",
    "name": "Cloud Security, CNAPP & DevSecOps",
    "family": "Cybersecurity, Information Assurance & Digital Trust",
    "icon": "Shield",
    "shortDescription": "Defending cloud native infrastructure, container runtimes, Kubernetes clusters, and automated shift-left CI/CD pipelines.",
    "overview": "Cloud Security & DevSecOps embeds security guardrails directly into cloud native software delivery. Engineers deploy Cloud Native Application Protection Platforms (CNAPP), perform container runtime defense, and ensure automated policy-as-code enforcement.",
    "whatProfessionalsDo": [
      "Deploy CNAPP platforms (Wiz, Prisma Cloud, Aqua Security) covering CSPM, CIEM, and CWPP across multi-cloud.",
      "Implement Policy-as-Code guardrails in CI/CD pipelines using Open Policy Agent (OPA) and Kyverno.",
      "Harden Kubernetes clusters against container escapes, misconfigurations, and unauthorized service account privileges.",
      "Automate container vulnerability scanning, signed image admission control, and secret detection."
    ],
    "coreTechnologies": [
      "Wiz / Prisma Cloud",
      "Kubernetes Security",
      "Open Policy Agent (OPA)",
      "Trivy / Snyk",
      "Terraform Security (tfsec/Checkov)",
      "AWS GuardDuty",
      "Falco"
    ],
    "prerequisites": [
      "Cloud architecture (AWS/Azure/GCP)",
      "Container and Kubernetes fundamentals",
      "DevOps CI/CD automation principles"
    ],
    "relatedDomains": [
      "cloud-computing-cloud-engineering",
      "devops-platform-engineering-sre",
      "penetration-testing-offensive-security"
    ],
    "careerProgression": "DevSecOps Engineer -> Cloud Security Architect -> Head of Cloud Security -> VP of Information Security",
    "sortOrder": 47
  },
  {
    "id": "application-security-software-supply-chain",
    "name": "Application Security (AppSec) & Supply Chain Security",
    "family": "Cybersecurity, Information Assurance & Digital Trust",
    "icon": "Lock",
    "shortDescription": "Securing software architectures against code vulnerabilities, third-party dependency risks, and open-source supply chain attacks.",
    "overview": "Application Security (AppSec) protects custom application code and open-source software supply chains. Engineers conduct threat modeling, embed automated SAST/DAST scanners into pull requests, and maintain cryptographic Software Bills of Materials (SBOMs).",
    "whatProfessionalsDo": [
      "Conduct architectural threat modeling (STRIDE / PASTA) during early design phases of software features.",
      "Integrate Static (SAST) and Dynamic (DAST) testing into developer IDEs and GitHub/GitLab pull requests.",
      "Generate, verify, and monitor Software Bills of Materials (SBOMs) using CycloneDX and SPDX standards.",
      "Guide engineering teams on mitigating OWASP Top 10 vulnerabilities (SQLi, SSRF, IDOR, XSS)."
    ],
    "coreTechnologies": [
      "Semgrep",
      "Snyk",
      "SonarQube",
      "Checkmarx",
      "OWASP ZAP",
      "Sigstore / Cosign",
      "CycloneDX",
      "Burp Suite"
    ],
    "prerequisites": [
      "Software engineering proficiency in at least two languages",
      "Deep understanding of web and API security vulnerabilities",
      "CI/CD pipeline integration skills"
    ],
    "relatedDomains": [
      "penetration-testing-offensive-security",
      "web-development-frontend-engineering",
      "backend-api-development"
    ],
    "careerProgression": "AppSec Analyst -> Application Security Engineer -> Principal AppSec Architect -> Head of Product Security",
    "sortOrder": 48
  },
  {
    "id": "digital-accessibility-design-systems",
    "name": "Digital Accessibility (A11y) & Design Systems",
    "family": "Product Management, UI/UX & Quality Engineering",
    "icon": "Eye",
    "shortDescription": "Engineering inclusive, WCAG 2.2-compliant web applications and enterprise-scale cross-platform design token systems.",
    "overview": "Digital Accessibility & Design Systems bridges visual design with technical empathy and regulatory compliance. Specialists build accessible component libraries that empower users with motor, visual, auditory, or cognitive impairments.",
    "whatProfessionalsDo": [
      "Audit and remediate web applications for WCAG 2.2 AA/AAA, Section 508, and European Accessibility Act compliance.",
      "Build design token architectures and accessible headless UI components using ARIA patterns.",
      "Test interfaces with screen readers (NVDA, JAWS, VoiceOver) and switch access devices.",
      "Conduct automated accessibility testing integrated into pull request CI/CD gates (Axe-core, Pa11y)."
    ],
    "coreTechnologies": [
      "W3C WAI-ARIA",
      "WCAG 2.2",
      "Axe-core",
      "NVDA & VoiceOver",
      "Figma Design Tokens",
      "React / Radix UI / Headless UI",
      "Storybook",
      "HTML5 Semantics"
    ],
    "prerequisites": [
      "Advanced HTML5 semantic web and CSS knowledge",
      "Familiarity with modern component frameworks (React/Vue)",
      "Assistive technology operation fundamentals"
    ],
    "relatedDomains": [
      "ui-ux-product-design",
      "web-development-frontend-engineering",
      "software-testing-quality-assurance"
    ],
    "careerProgression": "Accessibility Auditor -> Design Systems Engineer -> Principal Accessibility Architect -> Head of Inclusive Design",
    "sortOrder": 49
  },
  {
    "id": "intelligent-process-automation-rpa",
    "name": "Intelligent Process Automation (IPA) & Enterprise RPA",
    "family": "Enterprise Business Systems & Process Automation",
    "icon": "Cpu",
    "shortDescription": "Automating high-volume enterprise workflows through Robotic Process Automation (RPA), OCR, and AI document understanding.",
    "overview": "Intelligent Process Automation (IPA) merges classical Robotic Process Automation with computer vision and machine learning. Engineers automate complex back-office workflows across banking, insurance, healthcare, and logistics.",
    "whatProfessionalsDo": [
      "Design, build, and deploy software robots using UiPath, Automation Anywhere, or Microsoft Power Automate.",
      "Integrate Intelligent Document Processing (IDP) and OCR pipelines to extract unstructured invoice and medical data.",
      "Implement attended and unattended bot execution orchestrations with centralized credential vaults.",
      "Calculate automation ROI, bot utilization metrics, and exception handling runbooks."
    ],
    "coreTechnologies": [
      "UiPath",
      "Microsoft Power Automate",
      "Automation Anywhere",
      "ABBYY FlexiCapture",
      "C# / .NET",
      "Python",
      "SQL",
      "REST APIs"
    ],
    "prerequisites": [
      "Object-oriented programming (C# / Python)",
      "Enterprise business process analysis understanding",
      "Database and API interaction principles"
    ],
    "relatedDomains": [
      "enterprise-applications-erp-crm",
      "systems-architecture-enterprise-integration",
      "technology-consulting-technical-solutions"
    ],
    "careerProgression": "RPA Developer -> Intelligent Automation Lead -> Enterprise Automation Architect -> Head of Hyperautomation",
    "sortOrder": 50
  },
  {
    "id": "bioinformatics-computational-genomics",
    "name": "Bioinformatics & Computational Genomics",
    "family": "Industry Domain Technology (FinTech, HealthTech, GIS, SpaceTech)",
    "icon": "Dna",
    "shortDescription": "Analyzing biological sequencing data, genomic variants, molecular structures, and precision medical pipelines.",
    "overview": "Bioinformatics & Computational Genomics combines computer science, statistics, and molecular biology. Engineers build high-throughput sequencing pipelines, analyze DNA/RNA variants, and apply deep learning to protein folding.",
    "whatProfessionalsDo": [
      "Construct automated Next-Generation Sequencing (NGS) analysis pipelines using Nextflow, Snakemake, and GATK.",
      "Perform genomic variant calling, RNA-Seq differential expression analysis, and structural annotation.",
      "Apply machine learning models (AlphaFold, ESM) to predict protein structure and molecular drug interactions.",
      "Optimize high-performance bio-computing algorithms on cloud HPC clusters."
    ],
    "coreTechnologies": [
      "Nextflow",
      "Snakemake",
      "Python (Biopython)",
      "R (Bioconductor)",
      "GATK / SAMtools",
      "AlphaFold",
      "AWS Omics / Cromwell",
      "Docker"
    ],
    "prerequisites": [
      "Molecular biology and genomics fundamentals",
      "Proficiency in Python and Linux shell scripting",
      "Statistics and scientific data analysis"
    ],
    "relatedDomains": [
      "healthtech-medical-informatics",
      "data-science-statistical-modeling",
      "research-computing-scientific-technology"
    ],
    "careerProgression": "Bioinformatics Analyst -> Computational Biologist -> Senior Genomics Pipeline Engineer -> Director of Bioinformatics",
    "sortOrder": 51
  },
  {
    "id": "autonomous-mobility-aerial-drone-systems",
    "name": "Autonomous Mobility, Aerial & Drone Systems",
    "family": "Specialized & Deep Tech Engineering",
    "icon": "Navigation",
    "shortDescription": "Engineering autonomous vehicle stacks, drone flight control avionics, sensor fusion (LiDAR/Radar), and SLAM navigation.",
    "overview": "Autonomous Mobility & Drone Systems encompasses self-driving vehicles and unmanned aerial systems (UAS). Engineers build real-time perception, localization, mapping, and trajectory planning stacks executing on edge compute hardware.",
    "whatProfessionalsDo": [
      "Develop real-time sensor fusion algorithms combining LiDAR, Radar, cameras, and IMU data.",
      "Implement Simultaneous Localization and Mapping (SLAM) and precision GNSS-denied navigation.",
      "Program drone autopilot avionics and flight control software using PX4 and ArduPilot.",
      "Simulate vehicle dynamics and edge-case safety scenarios in CARLA and Gazebo."
    ],
    "coreTechnologies": [
      "C++20",
      "ROS 2",
      "PX4 Autopilot",
      "CUDA / TensorRT",
      "LiDAR / Point Cloud Library (PCL)",
      "CARLA Simulator",
      "SLAM Algorithms",
      "Linux RT-PREEMPT"
    ],
    "prerequisites": [
      "Robotics mathematics (linear algebra, coordinate transformations, Kalman filters)",
      "Low-latency C++ programming",
      "Real-time operating systems concepts"
    ],
    "relatedDomains": [
      "robotics-iot-industrial-automation",
      "computer-vision-deep-learning",
      "desktop-systems-embedded-software"
    ],
    "careerProgression": "Autonomy Software Engineer -> Perception / Motion Planning Specialist -> Principal Autonomous Systems Architect -> VP of Autonomous Technology",
    "sortOrder": 52
  },
  {
    "id": "executive-technology-leadership",
    "name": "Executive Technology Leadership & C-Suite",
    "family": "Technical Education, Governance & Executive Leadership",
    "icon": "Crown",
    "shortDescription": "Directing enterprise technology vision, engineering culture, security posture, data strategy, and multi-million dollar digital transformations.",
    "overview": "Executive Technology Leadership shapes the technical destiny of global enterprises. Leaders align technology investments with business strategy, build high-performing engineering organizations, ensure regulatory compliance, and drive digital innovation.",
    "whatProfessionalsDo": [
      "Formulate and execute multi-year technology roadmaps balancing innovation with operational stability.",
      "Recruit, mentor, and organize engineering teams into empowered, high-velocity product squads.",
      "Manage multi-million dollar technology capital and operational expenditure (CapEx / OpEx) budgets.",
      "Represent corporate technology posture to Board of Directors, enterprise customers, and regulatory auditors."
    ],
    "coreTechnologies": [
      "Strategic Technology Governance",
      "DORA & Engineering Metrics",
      "Enterprise Architecture Strategy",
      "Executive Risk Management",
      "CapEx/OpEx Budgeting"
    ],
    "prerequisites": [
      "10+ years of progressive engineering and architectural leadership",
      "Proven track record of delivering complex software platforms at scale",
      "Executive communication and financial acumen"
    ],
    "relatedDomains": [
      "it-governance-risk-it-leadership",
      "systems-architecture-enterprise-integration",
      "technology-consulting-technical-solutions"
    ],
    "careerProgression": "Director of Engineering -> VP of Technology / Engineering -> Chief Technology Officer (CTO) / Chief Information Officer (CIO)",
    "sortOrder": 53
  }
];

export const MASTER_CAREER_DOMAINS = CAREER_DOMAINS;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CAREER_FAMILIES,
    CAREER_LEVELS,
    CAREER_DOMAINS,
    MASTER_CAREER_DOMAINS: CAREER_DOMAINS
  };
}

