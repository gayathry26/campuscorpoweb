export const BASE_URL = 'https://campuscorpo.com';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'CampusCorpo',
  legalName: 'CampusCorpo Technologies',
  url: BASE_URL,
  logo: `${BASE_URL}/campuscorpo-full.png`,
  image: `${BASE_URL}/campuscorpo-full.png`,
  description: 'CampusCorpo is an integrated campus-to-career management platform connecting college placement operations, student development, faculty coordination, semester LMS, and institutional administration.',
  email: 'info@campuscorpo.com',
  telephone: '+91 90800 07926',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tirupur',
    addressRegion: 'Tamil Nadu',
    addressCountry: 'India'
  },
  sameAs: [
    'https://www.linkedin.com/company/campuscorpo',
    'https://twitter.com/campuscorpo',
    'https://github.com/campuscorpo'
  ]
};

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CampusCorpo Enterprise Platform',
  operatingSystem: 'Web Browser / Cloud SaaS',
  applicationCategory: 'EducationalApplication, BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Enterprise institutional licensing and personalized demo consultations upon request.'
  },
  description: 'Integrated Placement Management, Student 360°, Faculty Coordination, Semester LMS, Programming Assessment Engine, and AI Mock Interview Platform for colleges and universities.',
  author: {
    '@type': 'Organization',
    name: 'CampusCorpo'
  }
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'CampusCorpo',
  description: 'One Platform. Complete Campus Management & Placement Intelligence.',
  publisher: {
    '@id': `${BASE_URL}/#organization`
  }
};

export const routesSEO = {
  home: {
    path: '/',
    title: 'CampusCorpo — Smarter Placements. Complete Campus Management.',
    description: 'CampusCorpo unifies placement management, student profiles, faculty workloads, semester LMS, automated coding tests, and mock interviews into one enterprise platform.',
    keywords: 'Campus Management Software, Placement Management Software, College Placement Management System, Student Management System, Faculty Management Software, Learning Management System for Colleges, Online Coding Assessment Platform, Technical Mock Interview Platform',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` }
    ],
    faqs: [
      {
        question: 'What is CampusCorpo?',
        answer: 'CampusCorpo is a comprehensive campus-to-career management platform that connects institutional administration, student development, faculty coordination, semester LMS, and corporate placement operations into one unified ecosystem.'
      },
      {
        question: 'Who uses CampusCorpo?',
        answer: 'CampusCorpo is designed for college management, placement officers, training departments, faculty mentors, students, and corporate recruiters.'
      },
      {
        question: 'Does CampusCorpo support automated programming assessments?',
        answer: 'Yes. CampusCorpo features an online coding assessment engine with timed challenges, automated multi-language test-case evaluation, runtime benchmarking, and proctoring controls.'
      },
      {
        question: 'How does CampusCorpo connect students with companies?',
        answer: 'CampusCorpo provides location-based IT company discovery across major tech hubs (Chennai, Coimbatore, Bengaluru, Hyderabad, Pune) and maps student skills to 16 structured IT career domain roadmaps.'
      }
    ]
  },
  platform: {
    path: '/platform',
    title: 'Platform Overview — Unified Campus & Career Architecture | CampusCorpo',
    description: 'Explore CampusCorpo architecture connecting institution administration, semester LMS, student 360° portfolios, coding labs, and placement recruitment pipelines.',
    keywords: 'Campus Management Architecture, Higher Education ERP, University Operating System, Placement Portal Software, Campus LMS Platform',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Platform', item: `${BASE_URL}/platform` }
    ],
    faqs: [
      {
        question: 'What makes CampusCorpo different from legacy college ERP software?',
        answer: 'Unlike fragmented legacy ERPs, CampusCorpo bridges academic learning with verifiable career readiness by combining course code LMS management with built-in coding tests, AI-assisted mock interviews, and live placement drive pipelines.'
      },
      {
        question: 'Can CampusCorpo scale across multiple departments and semesters?',
        answer: 'Yes. CampusCorpo is engineered for multi-branch engineering and arts/science institutions, supporting granular role-based permissions, batch cohorts, and regulation mappings.'
      }
    ]
  },
  placementManagement: {
    path: '/solutions/placement-management',
    title: 'Placement Management Software for Colleges & Universities | CampusCorpo',
    description: 'Automate campus placement drives, student eligibility criteria, recruiter scheduling, ATS-style shortlisting, and real-time offer analytics with CampusCorpo.',
    keywords: 'Placement Management Software, College Placement Management System, TPO Software, Campus Recruitment System, Placement Drive Automation, Placement Eligibility Tracker',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Solutions', item: `${BASE_URL}/platform` },
      { name: 'Placement Management', item: `${BASE_URL}/solutions/placement-management` }
    ],
    faqs: [
      {
        question: 'What is placement management software?',
        answer: 'Placement management software is an enterprise institutional application that automates the end-to-end recruitment lifecycle on campus, including student registration, eligibility filtering by CGPA and backlogs, company drive scheduling, shortlisting, and placement analytics.'
      },
      {
        question: 'How can colleges manage placement activities efficiently?',
        answer: 'Colleges use centralized platforms like CampusCorpo to replace manual spreadsheets with automated eligibility checks, real-time drive notifications, recruiter communication portals, and one-click NAAC/NBA placement reports.'
      },
      {
        question: 'How does CampusCorpo support placement operations?',
        answer: 'CampusCorpo coordinates student verified resumes, dynamic eligibility criteria (CGPA, arrears, departmental branches), online assessment slotting, multi-round interview tracking, and CTC conversion analytics.'
      }
    ]
  },
  studentManagement: {
    path: '/solutions/student-management',
    title: 'Student Management System — 360° Digital Profiles | CampusCorpo',
    description: 'Centralize student academic history, semester progression, verified technical skills, coding benchmarks, and career readiness portfolios with CampusCorpo.',
    keywords: 'Student Management System, Student Information System, College Student Records, Academic Profile Software, Student Career Readiness Tracking',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Solutions', item: `${BASE_URL}/platform` },
      { name: 'Student Management', item: `${BASE_URL}/solutions/student-management` }
    ],
    faqs: [
      {
        question: 'What is a student management system?',
        answer: 'A student management system (SMS or SIS) is an institutional platform for maintaining accurate digital records of student admissions, academic progression, semester grades, attendance, and extracurricular milestones.'
      },
      {
        question: 'How can institutions manage student records seamlessly?',
        answer: 'Institutions use CampusCorpo to aggregate academic CGPA, semester attendance, verified coding challenges, mock interview feedback, and tier-based placement eligibility in a single digital portfolio.'
      }
    ]
  },
  facultyManagement: {
    path: '/solutions/faculty-management',
    title: 'Faculty Management Software — Course Codes & Mentorship | CampusCorpo',
    description: 'Coordinate faculty teaching workloads, course code allocations, class advisor duties, student mentorship logs, and academic milestones with CampusCorpo.',
    keywords: 'Faculty Management Software, Course Code Allocation, Faculty Workload Management, Class Advisor Software, Academic Mentorship Tracking',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Solutions', item: `${BASE_URL}/platform` },
      { name: 'Faculty Management', item: `${BASE_URL}/solutions/faculty-management` }
    ],
    faqs: [
      {
        question: 'How does CampusCorpo assist faculty coordination?',
        answer: 'CampusCorpo allocates course codes, manages teaching hours, tracks syllabus milestones, facilitates online quiz grading, and maintains confidential class advisor mentorship logs.'
      },
      {
        question: 'Can faculty members upload study materials directly for their subjects?',
        answer: 'Yes. Each faculty member is mapped to their specific course code, allowing them to upload lecture notes, slides, and code repositories directly to their allocated semester classroom.'
      }
    ]
  },
  administration: {
    path: '/solutions/administration',
    title: 'Administration Management & Role-Based Control | CampusCorpo',
    description: 'Institutional administration console for multi-department governance, batch migrations, role-based access control (RBAC), and high-speed data imports.',
    keywords: 'Campus Administration Software, Higher Education Governance, Role Based Access Control Education, College Data Import Excel CSV, Accreditation Audit Software',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Solutions', item: `${BASE_URL}/platform` },
      { name: 'Administration Management', item: `${BASE_URL}/solutions/administration` }
    ],
    faqs: [
      {
        question: 'What administrative controls are available in CampusCorpo?',
        answer: 'CampusCorpo provides multi-branch department hierarchy, academic calendar definitions, semester configuration, Excel/CSV/JSON bulk data import, and role-based access control (Principal, Dean, HOD, Faculty, TPO, Recruiter).'
      },
      {
        question: 'Does CampusCorpo support accreditation compliance audits?',
        answer: 'Yes. All academic milestones, attendance histories, and placement conversion rates are logged with complete audit trails to support NAAC, NBA, and NIRF accreditation criteria.'
      }
    ]
  },
  lms: {
    path: '/solutions/lms',
    title: 'Learning Management System (LMS) for Colleges | CampusCorpo',
    description: 'Semester-structured LMS supporting course code mapping, 7 subjects + 1 class advisor allocation, centralized study notes, quizzes, and assignment tracking.',
    keywords: 'Learning Management System for Colleges, College LMS, Semester Learning Portal, Course Code Mapping, Online Assignments Quizzes College',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Solutions', item: `${BASE_URL}/platform` },
      { name: 'Learning Management System', item: `${BASE_URL}/solutions/lms` }
    ],
    faqs: [
      {
        question: 'What is a college learning management system (LMS)?',
        answer: 'A college LMS is a dedicated software platform that facilitates digital delivery of syllabus materials, subject-specific lecture notes, online assignments, quizzes, and grading between faculty and students.'
      },
      {
        question: 'How does CampusCorpo handle semester subject allocations?',
        answer: 'In CampusCorpo, a semester classroom maps each course code (e.g. 7 theory/lab courses + 1 class advisor = 8 assigned faculty members) to its respective subject syllabus, study material repository, and quiz engine.'
      }
    ]
  },
  programmingAssessment: {
    path: '/features/programming-assessment',
    title: 'Online Coding Assessment Platform for Colleges | CampusCorpo',
    description: 'Evaluate real student technical skills with timed coding challenges, automated test-case execution, multi-language support, and proctoring locks.',
    keywords: 'Online Coding Assessment Platform, College Programming Assessment, Automated Test Case Evaluation, Coding Benchmark Software, Student Technical Skill Evaluation',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Features', item: `${BASE_URL}/platform` },
      { name: 'Programming Assessments', item: `${BASE_URL}/features/programming-assessment` }
    ],
    faqs: [
      {
        question: 'What is an online coding assessment platform?',
        answer: 'An online coding assessment platform is a software sandbox that presents algorithmic challenges to candidates, executes their code against automated test cases, and benchmarks runtime, memory efficiency, and problem-solving accuracy.'
      },
      {
        question: 'How can colleges evaluate students\' programming skills before placement drives?',
        answer: 'Colleges use CampusCorpo\'s coding assessment engine to conduct timed coding tests with automated test cases, proctoring navigation locks, and percentile rankings to identify drive-ready candidates.'
      }
    ]
  },
  mockInterviews: {
    path: '/features/mock-interviews',
    title: 'Technical & HR Mock Interview Platform | CampusCorpo',
    description: 'Prepare students for corporate campus interviews with role-based question banks, candidate transcription, 4-point rubric scoring, and remediation reports.',
    keywords: 'Technical Mock Interview Platform, HR Mock Interview System, College Interview Preparation Software, Interview Readiness Assessment, AI Mock Interview Feedback',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Features', item: `${BASE_URL}/platform` },
      { name: 'Mock Interviews', item: `${BASE_URL}/features/mock-interviews` }
    ],
    faqs: [
      {
        question: 'What is a technical mock interview?',
        answer: 'A technical mock interview is a structured practice interview that simulates real corporate recruitment rounds, testing a candidate\'s system architecture understanding, problem-solving articulation, and core domain knowledge.'
      },
      {
        question: 'How can students prepare for technical campus interviews?',
        answer: 'Students use CampusCorpo\'s mock interview simulation to answer role-specific technical and behavioral questions, receive rubric scores on articulation and problem solving, and review targeted remediation feedback.'
      }
    ]
  },
  companyExplorer: {
    path: '/company-explorer',
    title: 'IT Company Explorer — Chennai, Coimbatore, Bengaluru, Hyderabad, Pune | CampusCorpo',
    description: 'Discover verified IT companies, technology domains, hiring roles, and official career portals across India\'s leading tech clusters with CampusCorpo.',
    keywords: 'IT Company Explorer, IT Companies Chennai, IT Companies Coimbatore, IT Companies Bengaluru, IT Companies Hyderabad, IT Companies Pune, Tech Company Directory',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Company Explorer', item: `${BASE_URL}/company-explorer` }
    ],
    faqs: [
      {
        question: 'What is the CampusCorpo IT Company Explorer?',
        answer: 'The IT Company Explorer is a curated institutional directory that allows placement cells and students to explore technology companies by city (Chennai, Coimbatore, Bengaluru, Hyderabad, Pune), inspect active hiring tracks, and access official career portals.'
      },
      {
        question: 'Which cities are covered in the IT Company Explorer?',
        answer: 'CampusCorpo curates verified technology product and services companies across Chennai, Coimbatore, Bengaluru, Hyderabad, and Pune.'
      }
    ]
  },
  careerExplorer: {
    path: '/career-explorer',
    title: '16 IT Career Domains & Job Roles Taxonomy | CampusCorpo',
    description: 'Explore 16 core IT technology domains, prerequisite technical skills, developer toolchains, career progression ladders, and college learning roadmaps.',
    keywords: 'IT Career Explorer, IT Domains Taxonomy, Software Engineer Career Path, Cybersecurity Career Path, Cloud Computing Skills Roadmap, AI ML Career Progression',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Career Explorer', item: `${BASE_URL}/career-explorer` }
    ],
    faqs: [
      {
        question: 'What are the major IT career domains covered in CampusCorpo?',
        answer: 'CampusCorpo covers 16 core domains: Software Development, Web Development, Mobile Development, AI, Machine Learning, Data Science, Data Analytics, Cybersecurity, Cloud Computing, DevOps, Networking, UI/UX Design, Database Management, Blockchain, Embedded Systems, and Software Testing.'
      },
      {
        question: 'What skills are required for software developer roles?',
        answer: 'Software developers require strong foundations in data structures and algorithms, object-oriented programming (OOP), relational databases (SQL), RESTful APIs, version control (Git), and modern programming languages such as Java, Python, or JavaScript.'
      }
    ]
  },
  about: {
    path: '/about',
    title: 'About CampusCorpo — Campus-to-Career Institutional Operating System',
    description: 'CampusCorpo connects institutional administration, student development, faculty coordination, semester LMS, and corporate placement operations into one unified platform.',
    keywords: 'About CampusCorpo, CampusCorpo Mission, Campus Management Platform Company, EdTech Placement Platform India, Higher Education Operating System',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'About CampusCorpo', item: `${BASE_URL}/about` }
    ],
    faqs: [
      {
        question: 'Where is CampusCorpo headquartered?',
        answer: 'CampusCorpo is headquartered in Tirupur, Tamil Nadu, India, serving colleges, universities, and technical institutions across the nation.'
      },
      {
        question: 'What is CampusCorpo\'s core mission?',
        answer: 'CampusCorpo\'s mission is to eliminate institutional data silos, streamline administrative coordination, and provide every student with verifiable technical skills, interview readiness, and corporate career opportunities.'
      }
    ]
  },
  contact: {
    path: '/contact',
    title: 'Contact CampusCorpo — Request Institutional Consultation & Demo',
    description: 'Get in touch with CampusCorpo for institutional demos, placement cell onboarding, and technical assessment sandboxes. Official email: info@campuscorpo.com.',
    keywords: 'Contact CampusCorpo, Request CampusCorpo Demo, College Placement Software Consultation, Campus Management Support, CampusCorpo Tirupur Office',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: 'Contact Us', item: `${BASE_URL}/contact` }
    ],
    faqs: [
      {
        question: 'How do I schedule an institutional demo of CampusCorpo?',
        answer: 'You can request a personalized demo directly through our contact form, or by emailing info@campuscorpo.com or calling +91 90800 07926. Our solutions team will coordinate a walkthrough tailored to your campus.'
      },
      {
        question: 'How long does institutional onboarding take?',
        answer: 'CampusCorpo supports automated Excel, CSV, and JSON data imports for students, faculty, and course codes, enabling complete campus onboarding in days.'
      }
    ]
  },
  notFound: {
    path: '/404',
    title: 'Page Not Found (404) — CampusCorpo',
    description: 'The requested page could not be found. Navigate back to CampusCorpo\'s homepage or explore our placement management and career development solutions.',
    keywords: '404 Not Found, CampusCorpo',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_URL}/` },
      { name: '404 Not Found', item: `${BASE_URL}/404` }
    ],
    faqs: []
  }
};

