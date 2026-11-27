/**
 * CampusCorpo Normalized 3-Level Skill Analyzer Taxonomy
 * Structure: 62 IT Domains -> 210+ Job Roles -> Normalized Skills (with aliases)
 * Preserves all 102+ existing MySQL skills_catalogue IDs and eliminates duplicate skill entries.
 */

// Normalized Skills Dictionary (ID -> { id, name, category, aliases })
const BASE_SKILLS = [
  // Programming Languages
  { id: 'python', name: 'Python', category: 'Programming Languages', aliases: ['py', 'python3'] },
  { id: 'javascript', name: 'JavaScript', category: 'Programming Languages', aliases: ['js', 'es6', 'ecmascript'] },
  { id: 'typescript', name: 'TypeScript', category: 'Programming Languages', aliases: ['ts'] },
  { id: 'java', name: 'Java', category: 'Programming Languages', aliases: ['jdk', 'jvm', 'java21'] },
  { id: 'c', name: 'C', category: 'Programming Languages', aliases: ['clang', 'gcc'] },
  { id: 'cpp', name: 'C++', category: 'Programming Languages', aliases: ['cplusplus', 'cpp17', 'cpp20'] },
  { id: 'csharp', name: 'C#', category: 'Programming Languages', aliases: ['dotnet', '.net', 'c-sharp'] },
  { id: 'go', name: 'Go', category: 'Programming Languages', aliases: ['golang'] },
  { id: 'rust', name: 'Rust', category: 'Programming Languages', aliases: ['cargo'] },
  { id: 'kotlin', name: 'Kotlin', category: 'Programming Languages', aliases: ['kt'] },
  { id: 'swift', name: 'Swift', category: 'Programming Languages', aliases: ['swiftui'] },
  { id: 'php', name: 'PHP', category: 'Programming Languages', aliases: ['laravel'] },
  { id: 'r', name: 'R', category: 'Programming Languages', aliases: ['rlang', 'rstudio'] },
  { id: 'ruby', name: 'Ruby', category: 'Programming Languages', aliases: ['rails'] },
  { id: 'scala', name: 'Scala', category: 'Programming Languages', aliases: ['jvm'] },
  { id: 'dart', name: 'Dart', category: 'Programming Languages', aliases: ['flutter'] },
  { id: 'solidity', name: 'Solidity', category: 'Programming Languages', aliases: ['evm', 'smart contracts'] },
  { id: 'apex', name: 'Apex', category: 'Programming Languages', aliases: ['salesforce'] },
  { id: 'abap', name: 'SAP ABAP', category: 'Programming Languages', aliases: ['sap'] },

  // Frontend
  { id: 'html5', name: 'HTML5', category: 'Frontend', aliases: ['html', 'semantic html'] },
  { id: 'css3', name: 'CSS3', category: 'Frontend', aliases: ['css', 'flexbox', 'grid'] },
  { id: 'react', name: 'React', category: 'Frontend', aliases: ['reactjs', 'react.js'] },
  { id: 'next-js', name: 'Next.js', category: 'Frontend', aliases: ['nextjs', 'ssr'] },
  { id: 'angular', name: 'Angular', category: 'Frontend', aliases: ['angularjs'] },
  { id: 'vue-js', name: 'Vue.js', category: 'Frontend', aliases: ['vue', 'vuejs', 'nuxt'] },
  { id: 'tailwind-css', name: 'Tailwind CSS', category: 'Frontend', aliases: ['tailwind'] },
  { id: 'redux', name: 'Redux', category: 'Frontend', aliases: ['redux toolkit', 'state management'] },
  { id: 'webpack', name: 'Webpack & Vite', category: 'Frontend', aliases: ['vite', 'bundler'] },
  { id: 'sass', name: 'Sass / SCSS', category: 'Frontend', aliases: ['scss'] },
  { id: 'web-accessibility', name: 'Web Accessibility (WCAG)', category: 'Frontend', aliases: ['a11y', 'wcag'] },
  { id: 'pwa', name: 'Progressive Web Apps', category: 'Frontend', aliases: ['service workers'] },

  // Backend & APIs
  { id: 'node-js', name: 'Node.js', category: 'Backend', aliases: ['node', 'nodejs'] },
  { id: 'express-js', name: 'Express.js', category: 'Backend', aliases: ['express'] },
  { id: 'django', name: 'Django', category: 'Backend', aliases: ['drf'] },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend', aliases: ['uvicorn'] },
  { id: 'spring-boot', name: 'Spring Boot', category: 'Backend', aliases: ['spring', 'java spring'] },
  { id: 'aspnet-core', name: 'ASP.NET Core', category: 'Backend', aliases: ['dotnet core', '.net core'] },
  { id: 'rest-apis', name: 'REST APIs', category: 'Backend', aliases: ['restful', 'http', 'openapi', 'swagger'] },
  { id: 'graphql', name: 'GraphQL', category: 'Backend', aliases: ['apollo'] },
  { id: 'grpc', name: 'gRPC & Protobuf', category: 'Backend', aliases: ['protobuf', 'rpc'] },
  { id: 'microservices', name: 'Microservices Architecture', category: 'Backend', aliases: ['distributed systems'] },
  { id: 'kafka', name: 'Apache Kafka', category: 'Backend', aliases: ['event streaming', 'message queue'] },
  { id: 'rabbitmq', name: 'RabbitMQ', category: 'Backend', aliases: ['amqp', 'message broker'] },
  { id: 'oauth-jwt', name: 'OAuth2 & JWT Auth', category: 'Backend', aliases: ['jwt', 'sso', 'auth'] },

  // Mobile
  { id: 'react-native', name: 'React Native', category: 'Mobile', aliases: ['rn', 'expo'] },
  { id: 'flutter', name: 'Flutter', category: 'Mobile', aliases: ['dart'] },
  { id: 'android-sdk', name: 'Android SDK & Jetpack Compose', category: 'Mobile', aliases: ['android', 'jetpack'] },
  { id: 'ios-swiftui', name: 'iOS SDK & SwiftUI', category: 'Mobile', aliases: ['ios', 'xcode', 'uikit'] },

  // Databases
  { id: 'sql', name: 'SQL', category: 'Databases', aliases: ['rdbms', 'structured query'] },
  { id: 'mysql', name: 'MySQL', category: 'Databases', aliases: ['mariadb'] },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', aliases: ['postgres', 'psql'] },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases', aliases: ['mongo', 'nosql'] },
  { id: 'redis', name: 'Redis', category: 'Databases', aliases: ['caching', 'in-memory'] },
  { id: 'oracle-db', name: 'Oracle Database', category: 'Databases', aliases: ['plsql', 'oracle'] },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'Databases', aliases: ['elk', 'opensearch'] },
  { id: 'vector-db', name: 'Vector Databases (Pinecone/pgvector)', category: 'Databases', aliases: ['pinecone', 'qdrant', 'pgvector', 'milvus'] },
  { id: 'snowflake', name: 'Snowflake', category: 'Databases', aliases: ['data warehouse'] },
  { id: 'bigquery', name: 'Google BigQuery', category: 'Databases', aliases: ['bq'] },

  // Data Science, Analytics & AI
  { id: 'pandas', name: 'Pandas', category: 'Data Science & AI', aliases: ['dataframes'] },
  { id: 'numpy', name: 'NumPy', category: 'Data Science & AI', aliases: ['numerical python'] },
  { id: 'scikit-learn', name: 'Scikit-learn', category: 'Data Science & AI', aliases: ['sklearn'] },
  { id: 'tensorflow', name: 'TensorFlow', category: 'Data Science & AI', aliases: ['tf', 'keras'] },
  { id: 'pytorch', name: 'PyTorch', category: 'Data Science & AI', aliases: ['torch'] },
  { id: 'machine-learning', name: 'Machine Learning', category: 'Data Science & AI', aliases: ['ml', 'supervised learning'] },
  { id: 'deep-learning', name: 'Deep Learning', category: 'Data Science & AI', aliases: ['dl', 'neural networks'] },
  { id: 'nlp', name: 'Natural Language Processing', category: 'Data Science & AI', aliases: ['nlp', 'spacy', 'transformers'] },
  { id: 'computer-vision', name: 'Computer Vision (OpenCV)', category: 'Data Science & AI', aliases: ['cv', 'opencv', 'yolo'] },
  { id: 'llm-engineering', name: 'LLM Engineering & RAG', category: 'Data Science & AI', aliases: ['llm', 'rag', 'genai', 'gpt'] },
  { id: 'langchain', name: 'LangChain & LangGraph', category: 'Data Science & AI', aliases: ['langgraph', 'crewai', 'agents'] },
  { id: 'prompt-engineering', name: 'Prompt Engineering', category: 'Data Science & AI', aliases: ['prompting', 'evals'] },
  { id: 'mlops', name: 'MLOps (MLflow / Kubeflow)', category: 'Data Science & AI', aliases: ['mlflow', 'kubeflow', 'dvc'] },
  { id: 'power-bi', name: 'Power BI', category: 'Data Science & AI', aliases: ['powerbi', 'dax'] },
  { id: 'tableau', name: 'Tableau', category: 'Data Science & AI', aliases: ['bi', 'dashboards'] },
  { id: 'excel', name: 'Advanced Excel', category: 'Data Science & AI', aliases: ['spreadsheets', 'vba'] },
  { id: 'statistics', name: 'Statistics & Probability', category: 'Data Science & AI', aliases: ['hypothesis testing', 'ab testing'] },
  { id: 'apache-spark', name: 'Apache Spark', category: 'Data Science & AI', aliases: ['pyspark', 'big data'] },
  { id: 'apache-airflow', name: 'Apache Airflow', category: 'Data Science & AI', aliases: ['etl', 'dag'] },
  { id: 'dbt', name: 'dbt (Data Build Tool)', category: 'Data Science & AI', aliases: ['analytics engineering'] },
  { id: 'hadoop', name: 'Hadoop Ecosystem', category: 'Data Science & AI', aliases: ['hdfs', 'hive'] },

  // Cloud & DevOps
  { id: 'aws', name: 'Amazon Web Services (AWS)', category: 'DevOps & Cloud', aliases: ['ec2', 's3', 'lambda', 'iam'] },
  { id: 'azure', name: 'Microsoft Azure', category: 'DevOps & Cloud', aliases: ['aks', 'azure devops'] },
  { id: 'gcp', name: 'Google Cloud Platform (GCP)', category: 'DevOps & Cloud', aliases: ['gke', 'cloud run'] },
  { id: 'docker', name: 'Docker', category: 'DevOps & Cloud', aliases: ['containers', 'dockerfile'] },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps & Cloud', aliases: ['k8s', 'helm', 'eks', 'aks'] },
  { id: 'terraform', name: 'Terraform (IaC)', category: 'DevOps & Cloud', aliases: ['iac', 'hcl'] },
  { id: 'ansible', name: 'Ansible', category: 'DevOps & Cloud', aliases: ['config management'] },
  { id: 'ci-cd', name: 'CI/CD (GitHub Actions / Jenkins)', category: 'DevOps & Cloud', aliases: ['jenkins', 'github actions', 'gitlab ci'] },
  { id: 'linux', name: 'Linux Administration', category: 'DevOps & Cloud', aliases: ['ubuntu', 'bash', 'shell'] },
  { id: 'prometheus-grafana', name: 'Prometheus & Grafana', category: 'DevOps & Cloud', aliases: ['observability', 'monitoring', 'datadog'] },
  { id: 'git', name: 'Git & Version Control', category: 'DevOps & Cloud', aliases: ['github', 'gitlab'] },
  { id: 'nginx', name: 'Nginx & Load Balancing', category: 'DevOps & Cloud', aliases: ['reverse proxy', 'envoy'] },

  // Cybersecurity & Networking
  { id: 'network-security', name: 'Network Security & Firewalls', category: 'Cybersecurity', aliases: ['vpn', 'ids', 'ips'] },
  { id: 'penetration-testing', name: 'Penetration Testing', category: 'Cybersecurity', aliases: ['pentest', 'ethical hacking', 'kali'] },
  { id: 'siem-soc', name: 'SIEM & SOC Operations (Splunk)', category: 'Cybersecurity', aliases: ['splunk', 'qradar', 'sentinel'] },
  { id: 'owasp', name: 'OWASP & Web App Security', category: 'Cybersecurity', aliases: ['appsec', 'burp suite'] },
  { id: 'cloud-security', name: 'Cloud Security & IAM', category: 'Cybersecurity', aliases: ['zero trust', 'devsecops'] },
  { id: 'digital-forensics', name: 'Digital Forensics & Incident Response', category: 'Cybersecurity', aliases: ['dfir', 'autopsy', 'volatility'] },
  { id: 'tcp-ip', name: 'TCP/IP, Routing & Switching', category: 'Cybersecurity', aliases: ['ccna', 'bgp', 'dns', 'wireshark'] },
  { id: 'cryptography', name: 'Cryptography & PKI', category: 'Cybersecurity', aliases: ['tls', 'ssl', 'encryption'] },

  // QA & Testing
  { id: 'selenium', name: 'Selenium', category: 'Testing & QA', aliases: ['webdriver'] },
  { id: 'playwright', name: 'Playwright & Cypress', category: 'Testing & QA', aliases: ['cypress', 'e2e testing'] },
  { id: 'api-testing', name: 'API Testing (Postman / RestAssured)', category: 'Testing & QA', aliases: ['postman', 'restassured'] },
  { id: 'jest-unit-testing', name: 'Unit Testing (Jest / PyTest / JUnit)', category: 'Testing & QA', aliases: ['jest', 'pytest', 'junit'] },
  { id: 'jmeter', name: 'Performance Testing (JMeter / k6)', category: 'Testing & QA', aliases: ['k6', 'load testing'] },

  // UI/UX & Product
  { id: 'figma', name: 'Figma', category: 'UI/UX Design', aliases: ['prototyping', 'design systems'] },
  { id: 'ui-design', name: 'UI Design & Design Systems', category: 'UI/UX Design', aliases: ['visual design', 'typography'] },
  { id: 'ux-research', name: 'UX Research & Wireframing', category: 'UI/UX Design', aliases: ['usability testing', 'personas'] },
  { id: 'agile-scrum', name: 'Agile & Scrum', category: 'Product & Management', aliases: ['jira', 'kanban', 'sprint'] },
  { id: 'product-strategy', name: 'Product Strategy & Roadmapping', category: 'Product & Management', aliases: ['prd', 'okr', 'kpi'] },
  { id: 'business-analysis', name: 'Requirements & Business Analysis', category: 'Product & Management', aliases: ['bpmn', 'stakeholder'] },
  { id: 'technical-writing', name: 'Technical Documentation & OpenAPI Docs', category: 'Product & Management', aliases: ['markdown', 'docs-as-code', 'docusaurus'] },

  // Specialized & Emerging Tech
  { id: 'web3-ethers', name: 'Web3.js / Ethers.js & Hardhat', category: 'Emerging Tech', aliases: ['foundry', 'hardhat', 'defi'] },
  { id: 'unity', name: 'Unity 3D & C# Scripting', category: 'Emerging Tech', aliases: ['game dev', 'xr'] },
  { id: 'unreal-engine', name: 'Unreal Engine & Shaders', category: 'Emerging Tech', aliases: ['ue5', 'webgl', 'three.js'] },
  { id: 'ar-vr-xr', name: 'AR/VR (ARKit, ARCore, OpenXR)', category: 'Emerging Tech', aliases: ['xr', 'spatial computing'] },
  { id: 'embedded-rtos', name: 'Embedded C & RTOS', category: 'Emerging Tech', aliases: ['freertos', 'stm32', 'arm'] },
  { id: 'iot-mqtt', name: 'IoT Protocols (MQTT, Edge Computing)', category: 'Emerging Tech', aliases: ['raspberry pi', 'arduino', 'mqtt'] },
  { id: 'ros2', name: 'ROS2 & Robotics Control', category: 'Emerging Tech', aliases: ['ros', 'slam', 'gazebo'] },
  { id: 'arcgis-qgis', name: 'GIS (ArcGIS, QGIS, PostGIS)', category: 'Emerging Tech', aliases: ['geospatial', 'postgis', 'mapbox'] },
  { id: 'salesforce-lwc', name: 'Salesforce LWC & Admin', category: 'Enterprise Systems', aliases: ['crm', 'soql'] },
  { id: 'sap-erp', name: 'SAP S/4HANA & ERP Systems', category: 'Enterprise Systems', aliases: ['erp', 'oracle erp', 'dynamics 365'] },
  { id: 'fintech-payments', name: 'Payment Gateways, PCI-DSS & Core Banking', category: 'Industry Tech', aliases: ['stripe', 'upi', 'fintech'] },
  { id: 'healthtech-fhir', name: 'HL7 FHIR, HIPAA & Clinical Informatics', category: 'Industry Tech', aliases: ['ehr', 'dicom', 'healthtech'] },
  { id: 'itsm-helpdesk', name: 'ITSM, ServiceNow & Active Directory', category: 'IT Operations', aliases: ['servicenow', 'active directory', 'itil'] },
  { id: 'system-design', name: 'System Design & Software Architecture', category: 'Architecture', aliases: ['ddd', 'clean architecture', 'togaf'] },
];

// 62 Comprehensive IT Domains -> Job Roles -> Required & Related Skill IDs
const SKILL_DOMAINS = [
  {
    id: 'software-engineering-development',
    name: 'Software Engineering & Development',
    group: 'Software Engineering',
    roles: [
      { id: 'software-engineer', title: 'Software Engineer', required: ['python', 'java', 'git', 'sql', 'rest-apis', 'system-design', 'jest-unit-testing'], related: ['docker', 'typescript', 'ci-cd'] },
      { id: 'systems-software-engineer', title: 'Systems Software Engineer', required: ['c', 'cpp', 'rust', 'linux', 'git', 'system-design'], related: ['docker', 'tcp-ip'] },
      { id: 'application-developer', title: 'Application Developer', required: ['java', 'javascript', 'sql', 'rest-apis', 'git', 'jest-unit-testing'], related: ['react', 'spring-boot', 'docker'] },
    ],
  },
  {
    id: 'frontend-development',
    name: 'Frontend Development',
    group: 'Software Engineering',
    roles: [
      { id: 'frontend-developer', title: 'Frontend Developer', required: ['html5', 'css3', 'javascript', 'typescript', 'react', 'tailwind-css', 'git'], related: ['next-js', 'redux', 'web-accessibility', 'jest-unit-testing'] },
      { id: 'react-developer', title: 'React Developer', required: ['react', 'typescript', 'javascript', 'next-js', 'redux', 'tailwind-css', 'rest-apis', 'git'], related: ['graphql', 'jest-unit-testing', 'webpack'] },
      { id: 'angular-developer', title: 'Angular Developer', required: ['angular', 'typescript', 'html5', 'css3', 'rest-apis', 'git'], related: ['sass', 'jest-unit-testing', 'ci-cd'] },
      { id: 'vue-developer', title: 'Vue.js Developer', required: ['vue-js', 'javascript', 'typescript', 'html5', 'css3', 'tailwind-css', 'git'], related: ['rest-apis', 'webpack'] },
      { id: 'ui-engineer', title: 'UI Engineer', required: ['html5', 'css3', 'react', 'typescript', 'figma', 'web-accessibility', 'tailwind-css'], related: ['ui-design', 'sass'] },
      { id: 'web-developer', title: 'Web Developer', required: ['html5', 'css3', 'javascript', 'react', 'node-js', 'git', 'rest-apis'], related: ['pwa', 'tailwind-css', 'mysql'] },
    ],
  },
  {
    id: 'backend-api-development',
    name: 'Backend & API Development',
    group: 'Software Engineering',
    roles: [
      { id: 'backend-developer', title: 'Backend Developer', required: ['java', 'python', 'node-js', 'express-js', 'rest-apis', 'sql', 'mongodb', 'postgresql', 'redis', 'docker', 'git', 'api-testing'], related: ['microservices', 'kafka', 'oauth-jwt'] },
      { id: 'api-developer', title: 'API Developer', required: ['rest-apis', 'graphql', 'grpc', 'node-js', 'python', 'oauth-jwt', 'api-testing', 'git'], related: ['redis', 'docker', 'nginx'] },
      { id: 'java-developer', title: 'Java Developer', required: ['java', 'spring-boot', 'sql', 'postgresql', 'rest-apis', 'microservices', 'git', 'docker'], related: ['kafka', 'redis', 'jest-unit-testing'] },
      { id: 'python-developer', title: 'Python Developer', required: ['python', 'django', 'fastapi', 'postgresql', 'rest-apis', 'docker', 'git'], related: ['redis', 'celery', 'jest-unit-testing'] },
      { id: 'nodejs-developer', title: 'Node.js Developer', required: ['node-js', 'express-js', 'typescript', 'javascript', 'mongodb', 'postgresql', 'rest-apis', 'redis', 'git'], related: ['docker', 'graphql', 'oauth-jwt'] },
      { id: 'dotnet-developer', title: '.NET Developer', required: ['csharp', 'aspnet-core', 'sql', 'rest-apis', 'azure', 'git'], related: ['docker', 'microservices'] },
      { id: 'microservices-engineer', title: 'Microservices Engineer', required: ['microservices', 'docker', 'kubernetes', 'kafka', 'grpc', 'rest-apis', 'redis', 'system-design'], related: ['go', 'java', 'prometheus-grafana'] },
    ],
  },
  {
    id: 'full-stack-development',
    name: 'Full Stack Development',
    group: 'Software Engineering',
    roles: [
      { id: 'full-stack-developer', title: 'Full Stack Developer', required: ['html5', 'css3', 'javascript', 'typescript', 'react', 'node-js', 'express-js', 'postgresql', 'mongodb', 'rest-apis', 'docker', 'git'], related: ['next-js', 'tailwind-css', 'redis', 'aws'] },
      { id: 'mern-stack-developer', title: 'MERN Stack Developer', required: ['mongodb', 'express-js', 'react', 'node-js', 'javascript', 'rest-apis', 'tailwind-css', 'git'], related: ['typescript', 'redux', 'docker'] },
      { id: 'java-full-stack-developer', title: 'Java Full Stack Developer', required: ['java', 'spring-boot', 'react', 'typescript', 'sql', 'mysql', 'rest-apis', 'git'], related: ['angular', 'docker', 'aws'] },
    ],
  },
  {
    id: 'mobile-app-development',
    name: 'Mobile App Development',
    group: 'Software Engineering',
    roles: [
      { id: 'mobile-app-developer', title: 'Mobile App Developer', required: ['react-native', 'flutter', 'dart', 'typescript', 'rest-apis', 'git'], related: ['android-sdk', 'ios-swiftui', 'oauth-jwt'] },
      { id: 'cross-platform-developer', title: 'Cross-Platform Mobile Engineer', required: ['flutter', 'dart', 'react-native', 'typescript', 'rest-apis', 'git'], related: ['graphql', 'ci-cd'] },
    ],
  },
  {
    id: 'android-development',
    name: 'Android Development',
    group: 'Software Engineering',
    roles: [
      { id: 'android-developer', title: 'Android Developer', required: ['kotlin', 'java', 'android-sdk', 'rest-apis', 'sql', 'git'], related: ['ci-cd', 'oauth-jwt'] },
      { id: 'senior-android-engineer', title: 'Senior Android Engineer', required: ['kotlin', 'android-sdk', 'rest-apis', 'graphql', 'system-design', 'git'], related: ['ci-cd', 'jest-unit-testing'] },
    ],
  },
  {
    id: 'ios-development',
    name: 'iOS Development',
    group: 'Software Engineering',
    roles: [
      { id: 'ios-developer', title: 'iOS Developer', required: ['swift', 'ios-swiftui', 'rest-apis', 'git'], related: ['graphql', 'ci-cd', 'oauth-jwt'] },
    ],
  },
  {
    id: 'data-science',
    name: 'Data Science',
    group: 'Data & AI',
    roles: [
      { id: 'data-scientist', title: 'Data Scientist', required: ['python', 'sql', 'pandas', 'numpy', 'scikit-learn', 'statistics', 'machine-learning'], related: ['pytorch', 'tensorflow', 'tableau', 'r'] },
      { id: 'applied-scientist', title: 'Applied Scientist', required: ['python', 'pytorch', 'machine-learning', 'deep-learning', 'statistics', 'sql'], related: ['llm-engineering', 'mlops'] },
    ],
  },
  {
    id: 'data-analytics',
    name: 'Data Analytics',
    group: 'Data & AI',
    roles: [
      { id: 'data-analyst', title: 'Data Analyst', required: ['sql', 'excel', 'python', 'pandas', 'power-bi', 'tableau', 'statistics'], related: ['postgresql', 'bigquery'] },
      { id: 'product-data-analyst', title: 'Product Analyst', required: ['sql', 'statistics', 'tableau', 'python', 'excel'], related: ['dbt', 'power-bi'] },
    ],
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence',
    group: 'Data & AI',
    roles: [
      { id: 'bi-developer', title: 'BI Developer', required: ['sql', 'power-bi', 'tableau', 'excel', 'snowflake', 'postgresql'], related: ['dbt', 'python'] },
      { id: 'analytics-engineer', title: 'Analytics Engineer', required: ['sql', 'dbt', 'python', 'snowflake', 'bigquery', 'git'], related: ['apache-airflow', 'power-bi'] },
    ],
  },
  {
    id: 'artificial-intelligence',
    name: 'Artificial Intelligence',
    group: 'Data & AI',
    roles: [
      { id: 'ai-engineer', title: 'AI Engineer', required: ['python', 'pytorch', 'machine-learning', 'deep-learning', 'llm-engineering', 'fastapi', 'docker'], related: ['langchain', 'vector-db', 'mlops'] },
      { id: 'ai-research-engineer', title: 'AI Research Engineer', required: ['python', 'pytorch', 'tensorflow', 'deep-learning', 'statistics', 'nlp', 'computer-vision'], related: ['cpp', 'linux'] },
    ],
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    group: 'Data & AI',
    roles: [
      { id: 'ml-engineer', title: 'ML Engineer', required: ['python', 'scikit-learn', 'pytorch', 'tensorflow', 'machine-learning', 'sql', 'docker', 'mlops'], related: ['aws', 'kubernetes', 'fastapi'] },
    ],
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning',
    group: 'Data & AI',
    roles: [
      { id: 'deep-learning-engineer', title: 'Deep Learning Engineer', required: ['python', 'pytorch', 'tensorflow', 'deep-learning', 'numpy', 'linux'], related: ['computer-vision', 'nlp', 'cpp'] },
    ],
  },
  {
    id: 'generative-ai-llm',
    name: 'Generative AI & LLM Engineering',
    group: 'Data & AI',
    roles: [
      { id: 'genai-engineer', title: 'Generative AI Engineer', required: ['python', 'llm-engineering', 'langchain', 'vector-db', 'prompt-engineering', 'fastapi', 'docker'], related: ['pytorch', 'aws', 'typescript'] },
      { id: 'llm-engineer', title: 'LLM Engineer', required: ['python', 'pytorch', 'llm-engineering', 'nlp', 'vector-db', 'mlops', 'linux'], related: ['kubernetes', 'langchain'] },
    ],
  },
  {
    id: 'nlp',
    name: 'Natural Language Processing (NLP)',
    group: 'Data & AI',
    roles: [
      { id: 'nlp-engineer', title: 'NLP Engineer', required: ['python', 'nlp', 'pytorch', 'deep-learning', 'llm-engineering', 'pandas'], related: ['fastapi', 'vector-db'] },
    ],
  },
  {
    id: 'computer-vision',
    name: 'Computer Vision',
    group: 'Data & AI',
    roles: [
      { id: 'cv-engineer', title: 'Computer Vision Engineer', required: ['python', 'computer-vision', 'pytorch', 'tensorflow', 'deep-learning', 'cpp'], related: ['docker', 'embedded-rtos'] },
    ],
  },
  {
    id: 'data-engineering',
    name: 'Data Engineering',
    group: 'Data & AI',
    roles: [
      { id: 'data-engineer', title: 'Data Engineer', required: ['python', 'sql', 'apache-spark', 'apache-airflow', 'postgresql', 'snowflake', 'aws', 'docker'], related: ['kafka', 'dbt', 'bigquery'] },
      { id: 'etl-developer', title: 'ETL / Pipeline Developer', required: ['sql', 'python', 'apache-airflow', 'dbt', 'postgresql'], related: ['snowflake', 'aws'] },
    ],
  },
  {
    id: 'big-data-engineering',
    name: 'Big Data Engineering',
    group: 'Data & AI',
    roles: [
      { id: 'big-data-engineer', title: 'Big Data Engineer', required: ['apache-spark', 'hadoop', 'scala', 'python', 'kafka', 'sql', 'linux'], related: ['aws', 'kubernetes'] },
    ],
  },
  {
    id: 'database-administration',
    name: 'Database Administration',
    group: 'Data & AI',
    roles: [
      { id: 'database-administrator', title: 'Database Administrator (DBA)', required: ['sql', 'mysql', 'postgresql', 'oracle-db', 'linux', 'redis'], related: ['mongodb', 'aws', 'prometheus-grafana'] },
      { id: 'database-engineer', title: 'Database Engineer', required: ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'system-design'], related: ['elasticsearch', 'terraform'] },
    ],
  },
  {
    id: 'cloud-computing',
    name: 'Cloud Computing',
    group: 'Cloud & DevOps',
    roles: [
      { id: 'cloud-engineer', title: 'Cloud Engineer', required: ['aws', 'azure', 'linux', 'docker', 'terraform', 'tcp-ip', 'ci-cd'], related: ['kubernetes', 'python', 'cloud-security'] },
      { id: 'cloud-architect', title: 'Cloud Solutions Architect', required: ['aws', 'azure', 'gcp', 'system-design', 'terraform', 'kubernetes', 'cloud-security'], related: ['microservices', 'nginx'] },
    ],
  },
  {
    id: 'aws-cloud-engineering',
    name: 'AWS Cloud Engineering',
    group: 'Cloud & DevOps',
    roles: [
      { id: 'aws-engineer', title: 'AWS Cloud Engineer', required: ['aws', 'terraform', 'linux', 'docker', 'ci-cd', 'python', 'cloud-security'], related: ['kubernetes', 'postgresql'] },
    ],
  },
  {
    id: 'microsoft-azure',
    name: 'Microsoft Azure',
    group: 'Cloud & DevOps',
    roles: [
      { id: 'azure-engineer', title: 'Azure Cloud Engineer', required: ['azure', 'terraform', 'docker', 'kubernetes', 'ci-cd', 'cloud-security'], related: ['csharp', 'linux'] },
    ],
  },
  {
    id: 'google-cloud-platform',
    name: 'Google Cloud Platform (GCP)',
    group: 'Cloud & DevOps',
    roles: [
      { id: 'gcp-engineer', title: 'GCP Cloud Engineer', required: ['gcp', 'kubernetes', 'terraform', 'docker', 'bigquery', 'linux'], related: ['python', 'ci-cd'] },
    ],
  },
  {
    id: 'devops-engineering',
    name: 'DevOps Engineering',
    group: 'Cloud & DevOps',
    roles: [
      { id: 'devops-engineer', title: 'DevOps Engineer', required: ['linux', 'docker', 'kubernetes', 'ci-cd', 'terraform', 'ansible', 'aws', 'git', 'prometheus-grafana'], related: ['python', 'nginx', 'cloud-security'] },
      { id: 'platform-engineer', title: 'Platform Engineer', required: ['kubernetes', 'terraform', 'docker', 'go', 'ci-cd', 'aws', 'prometheus-grafana'], related: ['linux', 'system-design'] },
    ],
  },
  {
    id: 'site-reliability-engineering',
    name: 'Site Reliability Engineering (SRE)',
    group: 'Cloud & DevOps',
    roles: [
      { id: 'sre', title: 'Site Reliability Engineer', required: ['linux', 'kubernetes', 'prometheus-grafana', 'terraform', 'python', 'go', 'docker', 'tcp-ip'], related: ['aws', 'nginx', 'ci-cd'] },
    ],
  },
  {
    id: 'kubernetes-container-engineering',
    name: 'Kubernetes & Container Engineering',
    group: 'Cloud & DevOps',
    roles: [
      { id: 'kubernetes-engineer', title: 'Kubernetes Engineer', required: ['kubernetes', 'docker', 'linux', 'terraform', 'prometheus-grafana', 'nginx', 'ci-cd'], related: ['aws', 'go', 'cloud-security'] },
    ],
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    group: 'Cybersecurity',
    roles: [
      { id: 'security-analyst', title: 'Security Analyst', required: ['network-security', 'siem-soc', 'owasp', 'linux', 'tcp-ip'], related: ['python', 'cloud-security'] },
      { id: 'security-engineer', title: 'Security Engineer', required: ['network-security', 'cloud-security', 'owasp', 'cryptography', 'linux', 'python'], related: ['docker', 'terraform'] },
      { id: 'cloud-security-engineer', title: 'Cloud Security Engineer', required: ['cloud-security', 'aws', 'azure', 'kubernetes', 'terraform', 'network-security'], related: ['python', 'siem-soc'] },
    ],
  },
  {
    id: 'ethical-hacking-pentesting',
    name: 'Ethical Hacking & Penetration Testing',
    group: 'Cybersecurity',
    roles: [
      { id: 'penetration-tester', title: 'Penetration Tester', required: ['penetration-testing', 'owasp', 'network-security', 'linux', 'python', 'tcp-ip'], related: ['cryptography', 'cloud-security'] },
      { id: 'ethical-hacker', title: 'Ethical Hacker / Red Teamer', required: ['penetration-testing', 'owasp', 'linux', 'python', 'network-security'], related: ['c', 'cloud-security'] },
    ],
  },
  {
    id: 'security-operations-soc',
    name: 'Security Operations (SOC)',
    group: 'Cybersecurity',
    roles: [
      { id: 'soc-analyst', title: 'SOC Analyst', required: ['siem-soc', 'network-security', 'tcp-ip', 'linux', 'digital-forensics'], related: ['python', 'cloud-security'] },
    ],
  },
  {
    id: 'network-engineering',
    name: 'Network Engineering',
    group: 'Cybersecurity',
    roles: [
      { id: 'network-engineer', title: 'Network Engineer', required: ['tcp-ip', 'network-security', 'linux', 'nginx'], related: ['aws', 'python', 'ansible'] },
    ],
  },
  {
    id: 'network-security',
    name: 'Network Security',
    group: 'Cybersecurity',
    roles: [
      { id: 'network-security-engineer', title: 'Network Security Engineer', required: ['network-security', 'tcp-ip', 'cryptography', 'siem-soc', 'linux'], related: ['cloud-security', 'penetration-testing'] },
    ],
  },
  {
    id: 'digital-forensics',
    name: 'Digital Forensics',
    group: 'Cybersecurity',
    roles: [
      { id: 'digital-forensics-analyst', title: 'Digital Forensics Analyst', required: ['digital-forensics', 'siem-soc', 'linux', 'network-security', 'python'], related: ['cryptography', 'tcp-ip'] },
    ],
  },
  {
    id: 'blockchain-development',
    name: 'Blockchain Development',
    group: 'Emerging Tech',
    roles: [
      { id: 'blockchain-developer', title: 'Blockchain Developer', required: ['solidity', 'web3-ethers', 'typescript', 'node-js', 'cryptography', 'git'], related: ['rust', 'go'] },
      { id: 'smart-contract-auditor', title: 'Smart Contract Security Auditor', required: ['solidity', 'web3-ethers', 'owasp', 'cryptography', 'python'], related: ['rust'] },
    ],
  },
  {
    id: 'web3-development',
    name: 'Web3 Development',
    group: 'Emerging Tech',
    roles: [
      { id: 'web3-developer', title: 'Web3 Full-Stack Developer', required: ['solidity', 'web3-ethers', 'react', 'typescript', 'next-js', 'git'], related: ['node-js', 'graphql'] },
    ],
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design',
    group: 'Design & Product',
    roles: [
      { id: 'ui-designer', title: 'UI Designer', required: ['figma', 'ui-design', 'web-accessibility', 'html5', 'css3'], related: ['tailwind-css', 'ux-research'] },
      { id: 'ux-designer', title: 'UX Designer', required: ['figma', 'ux-research', 'ui-design', 'web-accessibility'], related: ['product-strategy'] },
      { id: 'ux-researcher', title: 'UX Researcher', required: ['ux-research', 'figma', 'statistics', 'business-analysis'], related: ['product-strategy'] },
      { id: 'interaction-designer', title: 'Interaction Designer', required: ['figma', 'ui-design', 'ux-research', 'css3', 'web-accessibility'], related: ['react'] },
    ],
  },
  {
    id: 'product-design',
    name: 'Product Design',
    group: 'Design & Product',
    roles: [
      { id: 'product-designer', title: 'Product Designer', required: ['figma', 'ui-design', 'ux-research', 'product-strategy', 'web-accessibility'], related: ['agile-scrum', 'html5'] },
    ],
  },
  {
    id: 'game-development',
    name: 'Game Development',
    group: 'Emerging Tech',
    roles: [
      { id: 'unity-game-developer', title: 'Unity Game Developer', required: ['unity', 'csharp', 'git'], related: ['ar-vr-xr', 'cpp'] },
      { id: 'unreal-game-developer', title: 'Unreal Engine Developer', required: ['unreal-engine', 'cpp', 'git'], related: ['ar-vr-xr'] },
    ],
  },
  {
    id: 'embedded-systems',
    name: 'Embedded Systems',
    group: 'Emerging Tech',
    roles: [
      { id: 'embedded-engineer', title: 'Embedded Systems Engineer', required: ['c', 'cpp', 'embedded-rtos', 'linux', 'git'], related: ['iot-mqtt', 'python'] },
    ],
  },
  {
    id: 'iot-development',
    name: 'IoT Development',
    group: 'Emerging Tech',
    roles: [
      { id: 'iot-engineer', title: 'IoT Solutions Engineer', required: ['iot-mqtt', 'embedded-rtos', 'python', 'c', 'aws', 'rest-apis'], related: ['docker', 'linux'] },
    ],
  },
  {
    id: 'robotics-engineering',
    name: 'Robotics Engineering',
    group: 'Emerging Tech',
    roles: [
      { id: 'robotics-engineer', title: 'Robotics Software Engineer', required: ['ros2', 'cpp', 'python', 'linux', 'computer-vision'], related: ['embedded-rtos', 'deep-learning'] },
    ],
  },
  {
    id: 'qa-software-testing',
    name: 'QA & Software Testing',
    group: 'Quality & Architecture',
    roles: [
      { id: 'qa-engineer', title: 'QA Engineer', required: ['api-testing', 'selenium', 'sql', 'agile-scrum', 'git'], related: ['playwright', 'jmeter'] },
      { id: 'performance-test-engineer', title: 'Performance Test Engineer', required: ['jmeter', 'api-testing', 'linux', 'prometheus-grafana'], related: ['python', 'docker'] },
    ],
  },
  {
    id: 'automation-testing',
    name: 'Automation Testing',
    group: 'Quality & Architecture',
    roles: [
      { id: 'sdet', title: 'SDET / Automation Test Engineer', required: ['selenium', 'playwright', 'api-testing', 'java', 'python', 'jest-unit-testing', 'ci-cd', 'git'], related: ['docker', 'typescript'] },
    ],
  },
  {
    id: 'software-architecture',
    name: 'Software Architecture',
    group: 'Quality & Architecture',
    roles: [
      { id: 'software-architect', title: 'Software Architect', required: ['system-design', 'microservices', 'aws', 'kubernetes', 'rest-apis', 'sql', 'cloud-security'], related: ['kafka', 'java', 'go'] },
    ],
  },
  {
    id: 'enterprise-architecture',
    name: 'Enterprise Architecture',
    group: 'Quality & Architecture',
    roles: [
      { id: 'enterprise-architect', title: 'Enterprise Architect', required: ['system-design', 'aws', 'azure', 'sap-erp', 'cloud-security', 'business-analysis'], related: ['microservices', 'agile-scrum'] },
    ],
  },
  {
    id: 'erp-crm-development',
    name: 'ERP & CRM Development',
    group: 'Enterprise Systems',
    roles: [
      { id: 'sap-developer', title: 'SAP ABAP / S/4HANA Developer', required: ['sap-erp', 'abap', 'sql', 'rest-apis'], related: ['business-analysis', 'javascript'] },
      { id: 'erp-consultant', title: 'ERP Technical Consultant', required: ['sap-erp', 'sql', 'business-analysis', 'agile-scrum'], related: ['abap', 'power-bi'] },
    ],
  },
  {
    id: 'salesforce-development',
    name: 'Salesforce Development',
    group: 'Enterprise Systems',
    roles: [
      { id: 'salesforce-developer', title: 'Salesforce Developer', required: ['apex', 'salesforce-lwc', 'javascript', 'rest-apis', 'git'], related: ['sql', 'ci-cd'] },
    ],
  },
  {
    id: 'it-support-administration',
    name: 'IT Support & Administration',
    group: 'IT Operations',
    roles: [
      { id: 'systems-administrator', title: 'Systems Administrator', required: ['linux', 'itsm-helpdesk', 'tcp-ip', 'network-security'], related: ['ansible', 'aws'] },
    ],
  },
  {
    id: 'it-infrastructure-management',
    name: 'IT Infrastructure Management',
    group: 'IT Operations',
    roles: [
      { id: 'infrastructure-engineer', title: 'Infrastructure Engineer', required: ['linux', 'terraform', 'aws', 'azure', 'tcp-ip', 'prometheus-grafana'], related: ['kubernetes', 'ansible'] },
    ],
  },
  {
    id: 'technical-support-engineering',
    name: 'Technical Support Engineering',
    group: 'IT Operations',
    roles: [
      { id: 'technical-support-engineer', title: 'Technical Support Engineer', required: ['itsm-helpdesk', 'sql', 'rest-apis', 'linux', 'tcp-ip'], related: ['api-testing', 'python'] },
    ],
  },
  {
    id: 'business-analysis',
    name: 'Business Analysis',
    group: 'Design & Product',
    roles: [
      { id: 'business-analyst', title: 'Business Analyst', required: ['business-analysis', 'sql', 'excel', 'power-bi', 'agile-scrum'], related: ['tableau', 'figma'] },
    ],
  },
  {
    id: 'product-management',
    name: 'Product Management',
    group: 'Design & Product',
    roles: [
      { id: 'product-manager', title: 'Technical Product Manager', required: ['product-strategy', 'agile-scrum', 'ux-research', 'sql', 'business-analysis'], related: ['figma', 'tableau'] },
    ],
  },
  {
    id: 'technical-project-management',
    name: 'Technical Project Management',
    group: 'Design & Product',
    roles: [
      { id: 'technical-project-manager', title: 'Technical Project Manager', required: ['agile-scrum', 'product-strategy', 'business-analysis', 'git'], related: ['ci-cd', 'aws'] },
    ],
  },
  {
    id: 'agile-scrum',
    name: 'Agile & Scrum',
    group: 'Design & Product',
    roles: [
      { id: 'scrum-master', title: 'Scrum Master / Agile Coach', required: ['agile-scrum', 'business-analysis', 'product-strategy'], related: ['ci-cd'] },
    ],
  },
  {
    id: 'ar-vr-development',
    name: 'AR/VR Development',
    group: 'Emerging Tech',
    roles: [
      { id: 'xr-developer', title: 'AR/VR / XR Developer', required: ['ar-vr-xr', 'unity', 'csharp', 'unreal-engine', 'git'], related: ['cpp', 'computer-vision'] },
    ],
  },
  {
    id: 'gis-geospatial-technology',
    name: 'GIS & Geospatial Technology',
    group: 'Industry Tech',
    roles: [
      { id: 'gis-developer', title: 'GIS & Geospatial Engineer', required: ['arcgis-qgis', 'python', 'postgresql', 'sql', 'javascript'], related: ['react', 'aws'] },
    ],
  },
  {
    id: 'fintech-development',
    name: 'FinTech Development',
    group: 'Industry Tech',
    roles: [
      { id: 'fintech-engineer', title: 'FinTech Backend Engineer', required: ['fintech-payments', 'java', 'python', 'postgresql', 'rest-apis', 'oauth-jwt', 'cryptography'], related: ['kafka', 'microservices'] },
    ],
  },
  {
    id: 'healthtech-development',
    name: 'HealthTech Development',
    group: 'Industry Tech',
    roles: [
      { id: 'healthtech-engineer', title: 'HealthTech Systems Engineer', required: ['healthtech-fhir', 'python', 'rest-apis', 'postgresql', 'cloud-security'], related: ['machine-learning', 'aws'] },
    ],
  },
  {
    id: 'mlops-ai-infrastructure',
    name: 'MLOps & AI Infrastructure',
    group: 'Data & AI',
    roles: [
      { id: 'mlops-engineer', title: 'MLOps Engineer', required: ['mlops', 'python', 'docker', 'kubernetes', 'terraform', 'aws', 'ci-cd', 'prometheus-grafana'], related: ['pytorch', 'apache-airflow'] },
    ],
  },
  {
    id: 'prompt-engineering-ai-automation',
    name: 'Prompt Engineering & AI Automation',
    group: 'Data & AI',
    roles: [
      { id: 'prompt-engineer', title: 'Prompt & AI Automation Engineer', required: ['prompt-engineering', 'llm-engineering', 'langchain', 'python', 'rest-apis'], related: ['vector-db', 'fastapi'] },
    ],
  },
  {
    id: 'technical-writing-documentation',
    name: 'Technical Writing & Documentation',
    group: 'Design & Product',
    roles: [
      { id: 'technical-writer', title: 'Technical Writer / Docs Engineer', required: ['technical-writing', 'git', 'rest-apis', 'html5'], related: ['javascript', 'figma'] },
    ],
  },
  {
    id: 'agentic-ai-autonomous-workflows',
    name: 'Agentic AI & Autonomous Workflows',
    group: 'Data & AI',
    roles: [
      { id: 'agentic-ai-engineer', title: 'Autonomous AI Agent Engineer', required: ['python', 'langchain', 'llm-engineering', 'vector-db', 'fastapi', 'prompt-engineering', 'docker'], related: ['redis', 'postgresql', 'mlops'] },
    ],
  },
  {
    id: 'api-engineering-sdk',
    name: 'API Engineering & SDK Development',
    group: 'Software Engineering',
    roles: [
      { id: 'sdk-platform-engineer', title: 'API & SDK Platform Engineer', required: ['rest-apis', 'graphql', 'grpc', 'typescript', 'go', 'python', 'oauth-jwt', 'technical-writing'], related: ['docker', 'nginx'] },
    ],
  },
];

module.exports = {
  BASE_SKILLS,
  SKILL_DOMAINS,
};
