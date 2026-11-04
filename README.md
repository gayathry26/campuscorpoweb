# CampusCorpo — Official Corporate Website

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-black)](#)

Official modern, responsive static website for **CampusCorpo** — a Placement, Faculty, and Student Management Platform.

---

## 🚀 Features & Architecture

- **Clean Corporate Black-and-White Visual Identity**: Minimalist, elegant design inspired by the CampusCorpo brand with subtle grayscale section accents.
- **Unified Navigation Bar**: Sticky header with brand logo, smooth section scrolling, mobile menu drawer, and "Get a Demo" triggers.
- **Command-Center Hero**: Features high-fidelity SaaS dashboard mockups showing active recruitment drives, student analytics, and accreditation readiness.
- **Modular Solutions Showcase**: Interactive cards detailing:
  1. *Placement Management*
  2. *Faculty Management*
  3. *Student Management*
  4. *Learning Management System (LMS)*
  5. *Campus Administration*
- **Strategic Advantages ("Why CampusCorpo?")**: 6 key value propositions highlighting institutional workflow automation.
- **Implementation Roadmap**: 4-phase horizontal timeline on desktop and vertical timeline on mobile.
- **Interactive Platform Experience**: Live role-based dashboard previews for Placement Cells, Students, Faculty, and Campus Admins.
- **Lead Capture & Demo Request**: Client-side validated contact form and demo modal with realistic confirmation states.
- **Production Build Ready**: Vite + Tailwind CSS bundle with 100% relative asset pathing and zero console warnings.

---

## 📁 Project Structure

```
d:\CAMPUSCORPO WEB\
├── public\
│   ├── _redirects             # SPA redirect rule for Netlify / static hosts
│   └── campuscorpo-logo.jpg   # Official brand logo asset
├── src\
│   ├── assets\                # Internal image and vector assets
│   ├── components\
│   │   ├── Navbar.jsx         # Sticky navigation with mobile drawer
│   │   ├── Hero.jsx           # Hero headline, CTAs & SaaS preview
│   │   ├── About.jsx          # Institutional mission & 3 pillars
│   │   ├── Solutions.jsx      # 5 Core product solutions
│   │   ├── WhyCampusCorpo.jsx # Key institutional benefits
│   │   ├── HowItWorks.jsx     # 4-Phase implementation timeline
│   │   ├── PlatformExperience.jsx # Role-based interactive tabs
│   │   ├── CallToAction.jsx   # Conversion CTA banner
│   │   ├── Contact.jsx        # Validated demo inquiry form
│   │   ├── Footer.jsx         # Links, socials, legal & back-to-top
│   │   └── DemoModal.jsx      # Quick-schedule demo dialog
│   ├── data\
│   │   └── websiteData.js     # Single-source static content & metrics
│   ├── App.jsx                # Layout orchestrator
│   ├── index.css              # Tailwind base, components & typography
│   └── main.jsx               # React entry point
├── dist\                      # Production build output
├── netlify.toml               # Netlify build & cache configuration
├── vercel.json                # Vercel routing & headers configuration
├── tailwind.config.js         # Tailwind color palette & font configuration
├── vite.config.js             # Vite build configuration (base: './')
└── package.json               # Dependencies & scripts
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open your browser at `http://localhost:5173` to view the live site.

### 3. Build for Production
```bash
npm run build
```
This generates the optimized static bundle in the `dist/` directory.

### 4. Preview the Production Build Locally
```bash
npm run preview
```

---

## 🌐 Custom Domain & Deployment Guide

The website is fully static and ready for direct deployment to any hosting provider or CDN, and can be mapped to your custom domain (e.g., `campuscorpo.com` or `www.campuscorpo.com`).

### Option A: Deploy to Vercel (Recommended)
1. Push this repository to GitHub / GitLab / Bitbucket.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the repository. Vercel will automatically detect `Vite` settings (`Build: npm run build`, `Output: dist`).
4. Click **Deploy**.
5. Go to **Project Settings → Domains**:
   - Add your apex domain: `campuscorpo.com`
   - Add your subdomain: `www.campuscorpo.com`
6. At your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains):
   - Set an `A` record for `@` pointing to `76.76.21.21`
   - Set a `CNAME` record for `www` pointing to `cname.vercel-dns.com`
7. SSL/HTTPS is provisioned automatically.

---

### Option B: Deploy to Netlify
1. Sign in to [Netlify](https://netlify.com) and select **"Add new site" → "Import an existing project"**.
2. Select your repository. The included `netlify.toml` file will automatically configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Redirect rules for SPA handling
3. Click **Deploy Site**.
4. In **Site Configuration → Domain management**, click **"Add custom domain"**.
5. Point your domain DNS records:
   - `A` record `@` to `75.2.60.5`
   - `CNAME` record `www` to your Netlify site address (`your-site.netlify.app`)
6. Automatic Let's Encrypt SSL certificates are provided.

---

### Option C: Cloudflare Pages
1. In the Cloudflare dashboard, go to **Workers & Pages → Create Application → Pages**.
2. Connect your Git repository.
3. Configure build preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Click **Save and Deploy**.
5. Under **Custom Domains**, add `campuscorpo.com`. Cloudflare manages DNS, SSL, and global edge caching automatically.

---

### Option D: Traditional Apache / Nginx / cPanel Static Hosting
1. Run `npm run build`.
2. Upload all files from the `dist/` folder directly to your web server root (e.g., `/var/www/html` or `public_html`).
3. For Nginx, ensure the fallback directive is present:
   ```nginx
   server {
       listen 80;
       server_name campuscorpo.com www.campuscorpo.com;
       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
4. Obtain an SSL certificate using Let's Encrypt / Certbot (`sudo certbot --nginx`).

---

## 📬 Custom Titan SMTP Mailer (Vercel Serverless Function)

The contact form and demo modal are connected to a custom backend mailer at [`/api/send.js`](api/send.js) using **Nodemailer** and **Titan SMTP**:

### SMTP Configuration
- **Host**: `smtp.titan.email`
- **Port**: `465` (SSL)
- **Sender & Receiver**: `info@campuscorpo.com`
- **Reply-To**: Automatically populated with the visitor's verified name and email address.

### Vercel Environment Variables
Add these under **Project Settings → Environment Variables** on Vercel:
```bash
TITAN_EMAIL=info@campuscorpo.com
TITAN_PASSWORD=your_titan_email_password
ENQUIRY_RECEIVER=info@campuscorpo.com
```

### Security & Spam Protection
- **Honeypot Trap**: Automated bot submissions are caught by a silent honeypot field.
- **IP Rate Limiting**: In-memory rate limiting prevents SMTP flooding.
- **Server-Side Validation**: All incoming fields are strictly validated before contacting the SMTP server.
- **Zero Exposed Secrets**: Credentials reside entirely inside serverless environment variables.

---

## 📄 License & Attribution

Copyright © 2026 CampusCorpo. All Rights Reserved.
Designed and built for institutional excellence.

