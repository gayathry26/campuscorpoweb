export const navigationLinks = [
  { name: 'Home', href: '#home' },
  { 
    name: 'Platform', 
    href: '#ecosystem',
    dropdown: [
      { name: 'Placement Management', href: '#placement-mgmt', category: 'Campus Management' },
      { name: 'Student Management', href: '#student-mgmt', category: 'Campus Management' },
      { name: 'Faculty Management', href: '#faculty-mgmt', category: 'Campus Management' },
      { name: 'Administration', href: '#admin-mgmt', category: 'Campus Management' },
      { name: 'LMS & Academics', href: '#lms-mgmt', category: 'Campus Management' },
      { name: 'Programming Assessments', href: '#coding-assessment', category: 'Career Development' },
      { name: 'Mock Interviews', href: '#mock-interviews', category: 'Career Development' },
      { name: 'IT Company Explorer', href: '#company-explorer', category: 'Career Development' },
      { name: 'Career Domains', href: '#career-explorer', category: 'Career Development' },
    ]
  },
  { name: 'Solutions', href: '#dashboards' },
  { name: 'Career Explorer', href: '#career-explorer' },
  { name: 'About', href: '#why-us' },
  { name: 'Contact', href: '#contact' },
];

// Complete Campus Management Modules (Section 4)
export const campusManagementModules = [
  {
    id: 'placement-mgmt',
    key: 'placement',
    title: 'Placement Management',
    headline: 'Manage the Entire Placement Lifecycle.',
    desc: 'Automate student eligibility, company partnerships, drive scheduling, shortlists, and placement conversion analytics.',
    icon: 'Briefcase',
    capabilities: [
      'Student placement registration & verified resume profiles',
      'Dynamic CGPA, backlogs & departmental eligibility rules',
      'Corporate partner directory & recruiter portal coordination',
      'End-to-end drive creation, test slotting & venue mapping',
      'Internship & full-time job opportunity management',
      'Real-time student application tracking & ATS-style pipelines',
      'Automated shortlisting, test scores & interview call loops',
      'Multi-round interview scheduling & recruiter feedback logging',
      'Offer letter tracking, CTC benchmarking & dual-offer controls',
      'Comprehensive company-wise, department-wise & batch reports'
    ],
    mockup: {
      tag: 'T&P Cell Command Hub',
      statPrimary: '91.8%',
      statPrimaryLabel: 'Placement Conversion Rate',
      statSecondary: '64 Drives',
      statSecondaryLabel: 'Active Hiring Cycles',
      statTertiary: '842',
      statTertiaryLabel: 'Verified Student Offers',
      recentRow: 'Zoho Corporation: 142 shortlists cleared Round 1 Coding Test'
    }
  },
  {
    id: 'student-mgmt',
    key: 'student',
    title: 'Student Management',
    headline: 'Every Student. One Complete Profile.',
    desc: 'Centralize academic credentials, verified skills, coding assessment benchmarks, mock ratings, and placement eligibility in one portfolio.',
    icon: 'Users',
    capabilities: [
      'Single source of truth student digital profile & roll mapping',
      'Personal, guardian, admission & academic history tracking',
      'Department, regulation batch & semester-wise progression records',
      'Continuous semester CGPA, SGPA, attendance & arrear history',
      'Verified programming skills & technical competency matrix',
      'Integrated ATS resume builder & dynamic project portfolio',
      'Automated tier-based placement eligibility classification',
      'Complete coding challenge test logs & percentile ranking',
      'AI & faculty mock interview scores with actionable logs',
      'Comprehensive career readiness index tracking'
    ],
    mockup: {
      tag: 'Student 360° Profile',
      statPrimary: '8.84',
      statPrimaryLabel: 'Cumulative CGPA (CS-2026)',
      statSecondary: 'Top 5%',
      statSecondaryLabel: 'Coding Benchmark Percentile',
      statTertiary: 'Dream Tier',
      statTertiaryLabel: 'Placement Eligibility Status',
      recentRow: 'Profile verified by Class Advisor • All 8 semester credits on track'
    }
  },
  {
    id: 'faculty-mgmt',
    key: 'faculty',
    title: 'Faculty Management',
    headline: 'Connect Faculty. Coordinate Better.',
    desc: 'Coordinate faculty workloads, course code allocations, class advisor duties, student mentorship logs, and academic milestones.',
    icon: 'GraduationCap',
    capabilities: [
      'Centralized faculty profiles, designations & domain specialties',
      'Departmental subject allocation & teaching workload balancing',
      'Course code & syllabus mapping with credit distribution',
      'Semester-wise faculty allocations and elective routing',
      'Class advisor assignments & cohort mentorship logs',
      'Continuous student attendance & academic intervention tracking',
      'Academic syllabus completion & milestone verification',
      'Internal assignments, lab quizzes & question paper approvals',
      'Faculty dashboard with live class rosters and submissions',
      'Automated NAAC / NBA criteria documentation export'
    ],
    mockup: {
      tag: 'Faculty Academic Workbench',
      statPrimary: '142',
      statPrimaryLabel: 'Active Faculty Members',
      statSecondary: '98.4%',
      statSecondaryLabel: 'Syllabus Milestone Sync',
      statTertiary: '8 Subjects',
      statTertiaryLabel: 'Allocated per Semester Section',
      recentRow: 'Dr. S. Ramanathan allocated CS8491 (Distributed Systems)'
    }
  },
  {
    id: 'admin-mgmt',
    key: 'admin',
    title: 'Administration Management',
    headline: 'Complete Institutional Control.',
    desc: 'Govern multi-branch departments, academic calendars, batch migrations, role-based access permissions, and automated data imports.',
    icon: 'Shield',
    capabilities: [
      'Multi-branch department creation & administrative hierarchy',
      'Academic year, regulation & term calendar configuration',
      'Year, section, and cohort batch routing rules',
      'Flexible semester configuration & elective bucket setups',
      'High-speed student data import via Excel, CSV, and JSON schemas',
      'Bulk faculty master data onboarding with verification',
      'Granular role-based access control (RBAC) across departments',
      'Configurable permissions: Dean, HOD, Faculty, TPO, Recruiter',
      'Semester-specific write/read overrides and grade freeze controls',
      'Audit logging, system security & institutional backup engine'
    ],
    mockup: {
      tag: 'Executive Institutional Console',
      statPrimary: '6 Depts',
      statPrimaryLabel: 'Engineering & Tech Wings',
      statSecondary: '4,850',
      statSecondaryLabel: 'Enrolled Active Students',
      statTertiary: '100%',
      statTertiaryLabel: 'Audit Log & Role Isolation',
      recentRow: 'Term 2026-27 Odd Semester configuration locked & approved'
    }
  },
  {
    id: 'lms-mgmt',
    key: 'lms',
    title: 'Learning Management System (LMS)',
    headline: 'One Learning Space for Every Semester.',
    desc: 'Structured semester learning spaces mapping every course code to allocated faculty, lecture materials, quizzes, and automated submissions.',
    icon: 'BookOpen',
    capabilities: [
      'Semester-based structured LMS rooms by department and section',
      'Exact subject-wise faculty allocation with course code mapping',
      'Support for 7 core theory/lab subjects + 1 class advisor (8 faculty cohort)',
      'Direct faculty-to-student discussion threads & doubt clearance',
      'Central study material repository (lecture slides, notes, code repos)',
      'Timed online assignments with plagiarism & delay flags',
      'Automated MCQ and descriptive quizzes with instant scoring',
      'Real-time student submission tracking & late-submission alerts',
      'Continuous student academic progress & internal mark aggregation',
      'Seamless linkage between academic LMS marks and placement readiness'
    ],
    mockup: {
      tag: 'Semester VI • Department of CSE',
      statPrimary: '7 Courses',
      statPrimaryLabel: '+ 1 Class Advisor (8 Faculty)',
      statSecondary: '96.2%',
      statSecondaryLabel: 'Assignment Submission Rate',
      statTertiary: '420+',
      statTertiaryLabel: 'Digital Course Materials',
      recentRow: 'Course CS8601 (Mobile Computing) - Quiz 03 results published'
    }
  }
];

// Connected Ecosystem Workflow (Section 6)
export const connectedEcosystemFlow = [
  { step: '01', title: 'Institution Setup', desc: 'Departments, academic years, semester structures, and regulations.', icon: 'Building' },
  { step: '02', title: 'Student & Faculty Management', desc: 'Centralized profiles, course allocations, and class advisor rosters.', icon: 'Users' },
  { step: '03', title: 'Academic & LMS Activities', desc: 'Course code materials, assignments, quizzes, and attendance tracking.', icon: 'BookOpen' },
  { step: '04', title: 'Programming Assessments', desc: 'Timed coding challenges with automated test-case evaluation.', icon: 'Code2' },
  { step: '05', title: 'Mock Interviews', desc: 'Technical & HR rounds with objective rubric and feedback reports.', icon: 'MessageSquareText' },
  { step: '06', title: 'Placement Readiness', desc: 'Aggregated readiness index based on academics, coding, and mocks.', icon: 'ShieldCheck' },
  { step: '07', title: 'Company Discovery', desc: 'City-wise IT company directory, hiring tracks, and role mapping.', icon: 'Compass' },
  { step: '08', title: 'Placement Drives & Recruitment', desc: 'Drive creation, applications, shortlisting, and interview loops.', icon: 'Briefcase' },
  { step: '09', title: 'Placement Analytics', desc: 'Departmental reports, median package indices, and accreditation exports.', icon: 'TrendingUp' }
];

// Platform Dashboard Showcase (Section 7)
export const platformDashboardShowcase = [
  {
    id: 'admin',
    role: 'Admin Dashboard',
    tagline: 'Complete Institutional Oversight & Control',
    description: 'Centralized governance of academic departments, faculty allocations, student cohorts, and data security.',
    badge: 'Executive Level',
    kpis: [
      { label: 'Total Enrolled Students', value: '4,850', sub: 'Across 6 departments' },
      { label: 'Allocated Faculty', value: '142', sub: '100% mapped to course codes' },
      { label: 'Active Semesters', value: '8', sub: 'Odd term 2026-27' },
      { label: 'Data Sync Health', value: '99.9%', sub: 'Excel / CSV imports verified' }
    ],
    highlights: [
      'Role-based permissions for Principal, Deans, HODs, and TPOs',
      'Multi-branch regulation and course code configuration',
      'Automated batch student onboarding and data migration'
    ]
  },
  {
    id: 'placement',
    role: 'Placement Officer Dashboard',
    tagline: 'Drive Automation & Candidate Conversion Engine',
    description: 'Coordinate corporate recruiters, filter candidate eligibility criteria, execute test slots, and track offers in real time.',
    badge: 'T&P Operations',
    kpis: [
      { label: 'Placement Conversion', value: '91.8%', sub: '842 of 910 eligible students' },
      { label: 'Active Corporate Drives', value: '18', sub: 'Zoho, Bosch, Freshworks, etc.' },
      { label: 'Average Package (CTC)', value: '₹7.4 LPA', sub: 'Highest: ₹28.5 LPA' },
      { label: 'Shortlists in Pipeline', value: '340+', sub: 'Technical interview stage' }
    ],
    highlights: [
      'One-click student eligibility filtering by CGPA & arrears',
      'Automated email notifications and test slot delivery',
      'Company-wise, department-wise, and gender-wise placement reports'
    ]
  },
  {
    id: 'faculty',
    role: 'Faculty Dashboard',
    tagline: 'Course Delivery & Student Mentorship Workbench',
    description: 'Manage allocated course codes, deliver lecture materials, monitor student attendance, and evaluate assignments.',
    badge: 'Academic Staff',
    kpis: [
      { label: 'Allocated Subjects', value: '3 Courses', sub: 'CS8491, CS8492, CS8461 Lab' },
      { label: 'Mentees / Cohort', value: '62 Students', sub: 'Class Advisor Section A' },
      { label: 'Assignment Turnaround', value: '96.2%', sub: 'Submissions graded online' },
      { label: 'Attendance Average', value: '89.4%', sub: 'Real-time alert thresholds' }
    ],
    highlights: [
      'Direct course code mapping for subject-specific study notes',
      'Online quizzes and code assignment evaluation',
      'Class advisor logs with academic intervention notes'
    ]
  },
  {
    id: 'student',
    role: 'Student Dashboard',
    tagline: 'Unified Academic & Career Acceleration Hub',
    description: 'Access course study materials, submit assignments, take timed coding assessments, and apply to eligible drives.',
    badge: 'Student Portal',
    kpis: [
      { label: 'Current CGPA', value: '8.84', sub: '0 Arrears • CSE Batch 2026' },
      { label: 'Coding Assessment Score', value: '94.2%', sub: 'Top 5th percentile' },
      { label: 'Mock Interview Rating', value: '4.6 / 5.0', sub: 'Technical + HR Cleared' },
      { label: 'Eligible Placement Drives', value: '12 Drives', sub: '3 Applications active' }
    ],
    highlights: [
      'Verified dynamic resume and digital skill portfolio',
      'Interactive coding sandbox with instant test feedback',
      'Application tracking from shortlisting to final offer letter'
    ]
  }
];

// Why CampusCorpo (Section 8: 6 Value Propositions)
export const whyCampusCorpoProps = [
  {
    title: 'Unified Campus Platform',
    desc: 'Replaces fragmented third-party tools with one integrated institutional operating system.',
    icon: 'Layers'
  },
  {
    title: 'Centralized Student Records',
    desc: 'Unifies academic scores, coding benchmarks, mock ratings, and resumes into a single digital profile.',
    icon: 'Database'
  },
  {
    title: 'Simplified Faculty Coordination',
    desc: 'Eliminates administrative friction with direct course code allocation, advisor tools, and LMS.',
    icon: 'Users'
  },
  {
    title: 'Smarter Placement Operations',
    desc: 'Automates eligibility filtering, drive scheduling, shortlists, and placement conversion reporting.',
    icon: 'TrendingUp'
  },
  {
    title: 'Technical Skill Assessment',
    desc: 'Tests real student capabilities through timed coding challenges and automated test case evaluation.',
    icon: 'Code2'
  },
  {
    title: 'Career Opportunity Discovery',
    desc: 'Empowers students with location-based IT company discovery and structured 16-domain career roadmaps.',
    icon: 'Compass'
  }
];

export const itCompaniesData = [
  {
    name: 'Zoho Corporation',
    city: 'Chennai',
    state: 'Tamil Nadu',
    domain: 'Enterprise SaaS & Cloud Software',
    roles: ['Software Developer', 'Product Engineer', 'DevOps Engineer'],
    website: 'https://www.zoho.com/careers/',
    type: 'Product'
  },
  {
    name: 'Freshworks',
    city: 'Chennai',
    state: 'Tamil Nadu',
    domain: 'Customer Engagement & CRM SaaS',
    roles: ['Frontend Engineer', 'Backend Engineer', 'QA Automation'],
    website: 'https://www.freshworks.com/company/careers/',
    type: 'Product'
  },
  {
    name: 'Kissflow',
    city: 'Chennai',
    state: 'Tamil Nadu',
    domain: 'Low-Code & Digital Workplace Platform',
    roles: ['Full Stack Developer', 'Cloud Architect'],
    website: 'https://kissflow.com/careers/',
    type: 'Product'
  },
  {
    name: 'Chargebee',
    city: 'Chennai',
    state: 'Tamil Nadu',
    domain: 'Subscription Billing & FinTech SaaS',
    roles: ['Software Engineer', 'Security Analyst', 'Data Analyst'],
    website: 'https://www.chargebee.com/careers/',
    type: 'Product'
  },
  {
    name: 'Bosch Global Software Technologies',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    domain: 'Embedded Systems, IoT & Mobility',
    roles: ['Embedded Software Engineer', 'AUTOSAR Developer', 'IoT Architect'],
    website: 'https://www.bosch-softwaretechnologies.com/',
    type: 'Technology'
  },
  {
    name: 'Kovai.co',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    domain: 'Enterprise Software & Azure Management SaaS',
    roles: ['C# .NET Developer', 'Angular Developer', 'Product Specialist'],
    website: 'https://www.kovai.co/careers/',
    type: 'Product'
  },
  {
    name: 'Payoda Technologies',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    domain: 'Digital Transformation & Healthcare Tech',
    roles: ['UI/UX Developer', 'React Developer', 'Cloud Engineer'],
    website: 'https://www.payoda.com/careers/',
    type: 'Services'
  },
  {
    name: 'Razorpay',
    city: 'Bengaluru',
    state: 'Karnataka',
    domain: 'Payments Infrastructure & FinTech',
    roles: ['Backend Engineer (Go/Java)', 'Site Reliability Engineer', 'Data Engineer'],
    website: 'https://razorpay.com/jobs/',
    type: 'Product'
  },
  {
    name: 'Flipkart',
    city: 'Bengaluru',
    state: 'Karnataka',
    domain: 'E-Commerce & Supply Chain Platforms',
    roles: ['Software Development Engineer', 'Applied Scientist', 'Data Scientist'],
    website: 'https://www.flipkartcareers.com/',
    type: 'Product'
  },
  {
    name: 'Zerodha',
    city: 'Bengaluru',
    state: 'Karnataka',
    domain: 'Stock Trading & FinTech Infrastructure',
    roles: ['Python Developer', 'Go Developer', 'Systems Engineer'],
    website: 'https://zerodha.com/careers/',
    type: 'Product'
  },
  {
    name: 'Microsoft IDC',
    city: 'Hyderabad',
    state: 'Telangana',
    domain: 'Cloud Services, Azure, Windows & AI',
    roles: ['Software Engineer', 'Cloud Solution Architect', 'AI Researcher'],
    website: 'https://careers.microsoft.com/',
    type: 'Product'
  },
  {
    name: 'ServiceNow',
    city: 'Hyderabad',
    state: 'Telangana',
    domain: 'Enterprise Workflow Automation & Cloud SaaS',
    roles: ['Platform Developer', 'Java Engineer', 'DevOps Specialist'],
    website: 'https://www.servicenow.com/careers.html',
    type: 'Product'
  },
  {
    name: 'Darwinbox',
    city: 'Hyderabad',
    state: 'Telangana',
    domain: 'Enterprise HRTech Cloud Platform',
    roles: ['Node.js Developer', 'React Native Engineer', 'Security Engineer'],
    website: 'https://darwinbox.com/careers',
    type: 'Product'
  },
  {
    name: 'Persistent Systems',
    city: 'Pune',
    state: 'Maharashtra',
    domain: 'Digital Engineering & Enterprise Modernization',
    roles: ['Cloud Data Engineer', 'Java Full Stack Developer', 'Salesforce Dev'],
    website: 'https://www.persistent.com/careers/',
    type: 'Technology'
  },
  {
    name: 'PubMatic',
    city: 'Pune',
    state: 'Maharashtra',
    domain: 'Digital Advertising Technology & Big Data',
    roles: ['Big Data Engineer', 'C++ Systems Engineer', 'Data Analyst'],
    website: 'https://pubmatic.com/careers/',
    type: 'Product'
  }
];

// 16 Complete IT Domains
export const itDomainsData = [
  {
    id: 'software-dev',
    title: 'Software Development',
    tagline: 'Core Application Architecture & System Engineering',
    roles: ['Software Engineer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'Java Developer', 'Python Developer'],
    skills: ['Data Structures & Algorithms', 'Object-Oriented Programming (OOP)', 'RESTful APIs & GraphQL', 'Relational Databases (SQL)', 'System Design Basics'],
    tools: ['Java / Spring Boot', 'Python / Django', 'JavaScript / TypeScript', 'PostgreSQL', 'Docker', 'Git'],
    progression: 'Junior SDE → SDE II → Senior Software Engineer → Technical Lead → Principal Architect',
    learningPath: 'Programming Fundamentals (Java/Python) → Data Structures & Algorithmic Problem Solving → Web Frameworks → Database Design → Distributed Systems'
  },
  {
    id: 'web-dev',
    title: 'Web Development',
    tagline: 'Modern Web Applications & Full-Stack Systems',
    roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 'Web Applications Architect', 'JAMstack Developer'],
    skills: ['HTML5, CSS3, Modern ES6+ JavaScript', 'React, Next.js, Vue Ecosystems', 'Node.js, Express, Fastify', 'API Integration & Authentication (OAuth/JWT)', 'Web Performance & Accessibility (a11y)'],
    tools: ['React.js', 'Next.js', 'Tailwind CSS', 'Node.js', 'Vite', 'Postman'],
    progression: 'Junior Web Dev → Full Stack Engineer → Lead Frontend Architect → Head of Web Engineering',
    learningPath: 'HTML/CSS/JS Core → Modern Frontend Framework (React) → Backend APIs with Node.js → Database Integration → Cloud Deployment (Vercel/AWS)'
  },
  {
    id: 'mobile-dev',
    title: 'Mobile Development',
    tagline: 'Native & Cross-Platform Mobile Applications',
    roles: ['Android Developer', 'iOS Developer', 'Flutter Developer', 'React Native Engineer', 'Mobile Systems Architect'],
    skills: ['Kotlin & Jetpack Compose', 'Swift & SwiftUI', 'Cross-Platform State Management', 'Mobile Storage (SQLite/Room/CoreData)', 'App Store & Play Store Deployment Pipelines'],
    tools: ['Android Studio', 'Xcode', 'Flutter / Dart', 'React Native', 'Firebase Mobile SDK'],
    progression: 'Associate Mobile Dev → Mobile Engineer → Senior App Architect → Director of Mobile Engineering',
    learningPath: 'Core OOP & Mobile OS Fundamentals → Native Android (Kotlin) or iOS (Swift) → Cross-Platform (Flutter/RN) → Offline Sync & API Security'
  },
  {
    id: 'ai',
    title: 'Artificial Intelligence',
    tagline: 'Intelligent Autonomous Systems & Cognitive Computing',
    roles: ['AI Research Engineer', 'Applied AI Scientist', 'NLP Specialist', 'Computer Vision Engineer', 'AI Solutions Architect'],
    skills: ['Deep Neural Networks', 'Transformer Architectures & Attention Mechanisms', 'Natural Language Processing (NLP)', 'Computer Vision (OpenCV/YOLO)', 'PyTorch & TensorFlow Foundations'],
    tools: ['PyTorch', 'TensorFlow', 'Hugging Face Transformers', 'OpenCV', 'Jupyter Lab', 'CUDA'],
    progression: 'AI Developer → AI Research Scientist → Staff AI Engineer → Chief AI Officer (CAIO)',
    learningPath: 'Linear Algebra & Probability Theory → Machine Learning Foundations → Deep Learning & PyTorch → Transformers & Foundation Models'
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    tagline: 'Predictive Modeling, Statistical Learning & Feature Engineering',
    roles: ['Machine Learning Engineer', 'MLOps Engineer', 'Predictive Modeler', 'Recommendation Systems Engineer'],
    skills: ['Supervised & Unsupervised Learning', 'Feature Engineering & Data Preprocessing', 'Model Hyperparameter Tuning', 'Ensemble Models (XGBoost, LightGBM)', 'Model Serialization & Serving'],
    tools: ['Scikit-Learn', 'XGBoost', 'MLflow', 'Pandas & NumPy', 'FastAPI for Model Serving'],
    progression: 'Junior ML Engineer → ML Engineer II → Lead MLOps Architect → Head of Machine Learning',
    learningPath: 'Applied Statistics & Python → Scikit-Learn Model Pipelines → Advanced Ensembles & Regression → Model Deployment & MLOps CI/CD'
  },
  {
    id: 'data-science',
    title: 'Data Science',
    tagline: 'Exploratory Analytics, Scientific Discovery & Hypothesis Testing',
    roles: ['Data Scientist', 'Decision Scientist', 'Quantitative Analyst', 'Applied Statistician'],
    skills: ['Statistical Inference & A/B Testing', 'Exploratory Data Analysis (EDA)', 'Predictive Modeling', 'Data Storytelling & Executive Visualizations', 'Hypothesis Testing & Metric Formulation'],
    tools: ['Python', 'R Programming', 'Seaborn & Matplotlib', 'Tableau', 'Jupyter', 'SQL BigQuery'],
    progression: 'Associate Data Scientist → Senior Data Scientist → Principal Scientist → VP of Data Science',
    learningPath: 'Statistics, Probability & Python → Data Wrangling with Pandas → Scientific Modeling & Scikit-Learn → Business Problem Translation & Storytelling'
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    tagline: 'Business Intelligence, Metrics Dashboards & Decision Support',
    roles: ['Data Analyst', 'Business Intelligence (BI) Analyst', 'Product Analyst', 'Financial Data Analyst', 'Marketing Analytics Specialist'],
    skills: ['Complex SQL Queries & CTEs', 'Data Warehousing Fundamentals', 'Interactive Dashboard Design', 'KPI Modeling & Metrics Definition', 'Excel / Spreadsheet Modeling'],
    tools: ['Power BI', 'Tableau', 'Advanced SQL', 'Google Looker Studio', 'Snowflake', 'Excel'],
    progression: 'Junior Data Analyst → BI Developer → Senior Product Analyst → Analytics Manager',
    learningPath: 'Advanced SQL & Data Extraction → Business Statistics → Tableau / Power BI Dashboards → Data Warehouse Modeling (Star Schema)'
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    tagline: 'Information Assurance, Threat Defense & Ethical Hacking',
    roles: ['Security Analyst (SOC)', 'Penetration Tester / Ethical Hacker', 'Security Engineer', 'Cloud Security Specialist', 'Incident Response Handler'],
    skills: ['Network Security & Firewalls', 'Penetration Testing & Vulnerability Assessment', 'OWASP Top 10 Web Security', 'SIEM & Threat Detection (Splunk/ELK)', 'Cryptography & PKI Infrastructure'],
    tools: ['Wireshark', 'Burp Suite', 'Metasploit', 'Nmap', 'Splunk', 'Kali Linux'],
    progression: 'SOC Analyst Tier 1 → Penetration Tester → Lead Security Engineer → Chief Information Security Officer (CISO)',
    learningPath: 'Networking Fundamentals & Linux Administration → Web App Security (OWASP) → SOC Analysis & SIEM → Certified Ethical Hacking (CEH/OSCP)'
  },
  {
    id: 'cloud-computing',
    title: 'Cloud Computing',
    tagline: 'Hyperscale Infrastructure, Cloud Architecture & Serverless',
    roles: ['Cloud Solutions Architect', 'Cloud Infrastructure Engineer', 'AWS / Azure Engineer', 'Site Reliability Engineer (SRE)'],
    skills: ['Virtualization & Cloud Compute', 'VPC, Subnets & Cloud Networking', 'Cloud Storage (S3, Blob) & Managed DBs', 'Serverless (Lambda, Cloud Functions)', 'High-Availability & Disaster Recovery'],
    tools: ['Amazon Web Services (AWS)', 'Microsoft Azure', 'Google Cloud Platform (GCP)', 'Terraform', 'CloudFormation'],
    progression: 'Cloud Associate → Cloud Systems Engineer → Senior Cloud Architect → Director of Cloud Infrastructure',
    learningPath: 'Linux & Networking Basics → AWS/Azure Practitioner → Solutions Architect Core Services → Multi-Region High-Availability Design'
  },
  {
    id: 'devops',
    title: 'DevOps',
    tagline: 'Continuous Delivery, Infrastructure as Code & Site Reliability',
    roles: ['DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Build & Release Engineer', 'Platform Engineer'],
    skills: ['Continuous Integration & Continuous Delivery (CI/CD)', 'Infrastructure as Code (IaC)', 'Containerization & Microservices', 'Container Orchestration (Kubernetes)', 'System Monitoring & Observability'],
    tools: ['Docker', 'Kubernetes', 'GitHub Actions', 'Jenkins', 'Terraform', 'Prometheus & Grafana'],
    progression: 'Junior DevOps → SRE → Senior Platform Engineer → VP of Infrastructure & Operations',
    learningPath: 'Linux Mastery & Shell Scripting → Docker Containerization → CI/CD Pipelines (GitHub Actions) → Kubernetes Orchestration → Terraform'
  },
  {
    id: 'networking',
    title: 'Networking',
    tagline: 'Enterprise Network Engineering & Protocol Design',
    roles: ['Network Engineer', 'Network Administrator', 'Systems & Network Specialist', 'Network Security Architect'],
    skills: ['TCP/IP, BGP, OSPF Protocols', 'Subnetting & VLAN Configuration', 'Firewalls & VPNs', 'SDN & Network Virtualization', 'Troubleshooting & Packet Analysis'],
    tools: ['Cisco Packet Tracer', 'GNS3', 'Wireshark', 'PuTTY', 'Fortinet'],
    progression: 'Network Admin → Network Engineer → Senior Infrastructure Lead → Enterprise Network Director',
    learningPath: 'CompTIA Network+ Fundamentals → Cisco CCNA Core → Routing & Switching → Enterprise Network Security'
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    tagline: 'Human-Centered Interaction & Design Systems',
    roles: ['UI/UX Designer', 'Product Designer', 'Interaction Designer', 'Design Systems Engineer', 'User Researcher'],
    skills: ['Wireframing & Prototyping', 'User Research & Personas', 'Information Architecture', 'Design Systems & Tokens', 'Micro-Interactions'],
    tools: ['Figma', 'FigJam', 'Adobe XD', 'Protopie', 'Maze', 'Notion'],
    progression: 'Junior Designer → Product Designer → Senior UX Lead → Head of Design',
    learningPath: 'Design Principles & Hierarchy → Wireframing to High-Fidelity UI → Usability Testing → Tokenized Design Systems'
  },
  {
    id: 'database-admin',
    title: 'Database Management',
    tagline: 'High-Availability RDBMS & NoSQL Datastores',
    roles: ['Database Administrator (DBA)', 'Database Developer', 'Data Architect', 'Database Reliability Engineer'],
    skills: ['Query Optimization & Indexing', 'Replication, Sharding & Clustering', 'Backup & Disaster Recovery', 'Database Schema Normalization', 'ACID Concurrency Controls'],
    tools: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle DB', 'pgAdmin'],
    progression: 'Junior DBA → Database Engineer → Lead DBA → Chief Data Architect',
    learningPath: 'Relational Schema Design → Index Tuning & Query Execution Plans → High-Availability Clusters & Replication'
  },
  {
    id: 'blockchain',
    title: 'Blockchain',
    tagline: 'Decentralized Ledgers & Smart Contract Systems',
    roles: ['Blockchain Developer', 'Smart Contract Engineer', 'Solidity Developer', 'Web3 Protocol Architect'],
    skills: ['Cryptographic Hash Functions', 'Consensus Algorithms', 'Smart Contract Security', 'Gas Optimization', 'EVM Architecture'],
    tools: ['Solidity', 'Hardhat', 'Truffle', 'Ethers.js', 'MetaMask', 'Remix IDE'],
    progression: 'Web3 Developer → Smart Contract Auditor → Protocol Engineer → Lead Blockchain Architect',
    learningPath: 'Blockchain Core Mechanics → Solidity Development → Smart Contract Auditing & Security Testing'
  },
  {
    id: 'embedded-systems',
    title: 'Embedded Systems',
    tagline: 'Low-Level Hardware, Firmware & Microcontrollers',
    roles: ['Embedded Software Engineer', 'Firmware Developer', 'IoT Systems Engineer', 'Hardware-Software Integration Specialist'],
    skills: ['Embedded C / C++', 'Microcontroller Programming (ARM / AVR)', 'I2C, SPI, UART Protocols', 'RTOS (Real-Time Operating Systems)', 'Sensor Interfacing'],
    tools: ['Keil uVision', 'STM32CubeIDE', 'Arduino IDE', 'Oscilloscopes', 'JTAG Debuggers'],
    progression: 'Firmware Engineer → Embedded Systems Specialist → Technical Lead → Systems Architect',
    learningPath: 'Digital Electronics & C Fundamentals → Microcontroller Architecture → RTOS Concurrency → Hardware Interfacing'
  },
  {
    id: 'software-testing',
    title: 'Software Testing',
    tagline: 'Test Automation, Load Verification & Quality Assurance',
    roles: ['QA Automation Engineer', 'Software Development Engineer in Test (SDET)', 'Performance Test Engineer', 'Manual & Security QA Specialist'],
    skills: ['Automated Test Scripting', 'Test Case Design & Matrix', 'Regression Testing', 'API Test Automation', 'Load & Stress Testing'],
    tools: ['Selenium', 'Cypress', 'Playwright', 'JMeter', 'Postman', 'TestRail'],
    progression: 'QA Analyst → Automation Engineer → SDET II → QA Director',
    learningPath: 'Manual Testing & Defect Lifecycles → Java/Python for Automation → Cypress / Playwright Frameworks → CI/CD Integration'
  }
];

export const codingAssessmentMockData = {
  problemId: 'LC-204',
  title: 'Two Sum with Sorted Window Constraints',
  difficulty: 'Medium',
  timeLimit: '45 mins',
  memoryLimit: '256 MB',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.',
  starterCode: `function findTargetPair(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
  testCases: [
    { id: 1, input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]', actual: '[0, 1]', status: 'Passed', runtime: '21 ms' },
    { id: 2, input: 'nums = [3,2,4], target = 6', expected: '[1, 2]', actual: '[1, 2]', status: 'Passed', runtime: '18 ms' },
    { id: 3, input: 'nums = [3,3], target = 6', expected: '[0, 1]', actual: '[0, 1]', status: 'Passed', runtime: '19 ms' },
    { id: 4, input: 'nums = [1,5,8,12,19], target = 20', expected: '[0, 4]', actual: '[0, 4]', status: 'Passed', runtime: '24 ms' },
    { id: 5, input: 'nums = [100000 elements], target = 184920', expected: '[2410, 89401]', actual: '[2410, 89401]', status: 'Passed', runtime: '42 ms' }
  ],
  metrics: {
    status: 'All Test Cases Passed',
    score: '100 / 100',
    runtime: '24.8 ms',
    memory: '42.1 MB',
    percentile: 'Top 96.4%'
  }
};

export const mockInterviewMockData = {
  candidate: 'Rohit Balaji (Final Year CS)',
  role: 'Software Development Engineer - Backend (Node.js / Distributed Systems)',
  round: 'Technical Interview Round 1',
  duration: '32 mins completed',
  overallScore: 89,
  scores: [
    { label: 'Technical Problem Solving', score: 92 },
    { label: 'System Design Logic', score: 86 },
    { label: 'Code Optimization & Complexity', score: 90 },
    { label: 'Communication & Articulation', score: 88 }
  ],
  sampleQuestion: 'How would you handle race conditions when two concurrent requests attempt to decrement the same inventory stock in a relational database?',
  candidateAnswer: 'I would use pessimistic locking with "SELECT FOR UPDATE" on the row within a transactional boundary, or apply optimistic locking using an integer version column where the UPDATE statement checks "WHERE version = current_version". If high throughput is needed, an atomic decrement with Redis or row-level idempotency keys can prevent double deduction.',
  evaluationFeedback: [
    { category: 'Strength', text: 'Accurately articulated both pessimistic and optimistic concurrency patterns with exact SQL semantics.' },
    { category: 'Observation', text: 'Good mention of Redis atomic decr for high-throughput scaling scenarios.' },
    { category: 'Recommendation', text: 'Could expand on deadlock resolution strategies when multiple rows are locked simultaneously.' }
  ]
};

export const companyDetails = {
  name: 'CampusCorpo',
  tagline: 'One Platform. Complete Campus Management.',
  description: 'CampusCorpo connects student management, faculty coordination, semester LMS, administration, and placement operations into one unified enterprise platform.',
  year: '2026',
  email: 'info@campuscorpo.com',
  phone: '+91 90800 07926',
  phoneRaw: '+919080007926',
  address: 'Tirupur, Tamil Nadu, India',
  socials: [
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: 'Linkedin' },
    { name: 'Twitter / X', href: 'https://x.com', icon: 'Twitter' },
    { name: 'GitHub', href: 'https://github.com', icon: 'Github' }
  ]
};
