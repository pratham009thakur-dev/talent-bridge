# TalentBridge — Full-Stack MERN Recruitment & Job Portal Platform

TalentBridge is an enterprise-grade, full-stack recruitment and career management platform built with **MongoDB, Express.js, React (Vite), and Node.js**. Engineered with a strict Role-Based Access Control (RBAC) architecture, it connects candidates, employers, and platform administrators through automated PDF resume parsing, deterministic skill-compatibility matching, and real-time application tracking.

---

## Key Capabilities

### 1. Multi-Role Architecture (RBAC)
* **Candidate Workspace:** Build structured profiles (education, experience, projects, skills), upload PDF resumes with automated text extraction and preview merging, inspect compatibility match scores on open roles, apply with one click, track application lifecycle stages, withdraw pending applications, and bookmark opportunities.
* **Employer Console:** Manage company profiles, publish and edit job openings, inspect skill-ranked applicants, securely view authorized candidate PDF resumes, and advance candidates through hiring stages (`Applied` → `Under Review` → `Shortlisted` → `Interview Scheduled` → `Hired` / `Rejected`).
* **Platform Admin Governance:** Monitor platform-wide MongoDB aggregation analytics via interactive Recharts visualizations, manage user account statuses, and moderate/approve/flag job listings.

### 2. Core Technical Engines
* **PDF Resume Parser (`pdf-parse` + `multer`):** Validates file MIME types (`application/pdf`) and size caps (5MB), extracts text buffers server-side, detects contact details and technical skills, and presents extracted fields for candidate verification before persisting.
* **Deterministic Job Matching Engine:** Computes transparent compatibility percentages (60% skill overlap, 25% experience threshold alignment, 15% location/remote alignment) with itemized matching skills and skill gaps.
* **Protected Resume Access:** Resumes are never exposed publicly via static URLs; streaming is gated behind JWT verification so only the candidate owner, platform administrators, or employers who have received an application from that candidate can view the PDF.

---

## Tech Stack

* **Frontend:** React 18, Vite, React Router DOM v6, Tailwind CSS, Axios, Lucide React, Recharts
* **Backend:** Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, Multer, `pdf-parse`, Helmet, Express Rate Limit
* **Database:** MongoDB Atlas & Mongoose ODM

---

## Local Setup & Installation

### Prerequisites
* Node.js v18+
* MongoDB Atlas cluster URI (or local MongoDB instance)

### 1. Clone & Install Dependencies
```bash
git clone <your-repository-url>
cd job-portal-system

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install