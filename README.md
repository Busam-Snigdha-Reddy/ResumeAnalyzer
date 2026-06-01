# MERN Resume Analyzer

An advanced, premium ATS Resume Analyzer built with the MERN stack (MongoDB, Express, React, Node.js). It scans PDF/DOCX resume files, maps formatting elements and keyword gaps, overlays AI feedback directly onto visual page coordinates, and generates mock interview sessions customized to the user's skill gaps.

---

## Project Architecture
The project is split into two main directory workspaces:

1. **[Backend Server](./Backend/README.md)**: A Node.js Express API linked to MongoDB, managing file uploads with Multer, hosting resume document assets securely on Cloudinary, running text parsing engines (PDF & Word), and managing an asynchronous background job processing queue.
2. **[Frontend Client](./Frontend/README.md)**: A React UI built on Vite, styled with custom Glassmorphism CSS, featuring an interactive canvas overlay to display text coordinate feedback dynamically, and a complete interview simulation module.

---

##  Key Features

* **Visual Coordinate Canvas**: Renders uploaded PDF pages directly inside the browser using PDF.js. Stored feedback suggestions are mapped to exact layout coordinates and highlighted dynamically.
* **Role Tailoring Gap Engine**: Upload your resume and paste any target job description. The backend processes the differences and returns matched skills, missing skills, and granular bullet-point instructions.
* **Mock Role Simulation**: Automatically generates custom technical interview questions (complete with detailed answer keys) targeting the specific skill gaps discovered during the tailoring check.
* **Asynchronous Queue Pipeline**: Resume uploads and job description analyses are managed using a robust MongoDB-backed task queue system to prevent request timeouts and server bloat.

---

##  Quick Start

###  Prerequisites
* Node.js (v18+)
* MongoDB connection string
* Cloudinary account credentials

### 1. Set Up the Backend
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your local `.env` variables (see the [Backend README](./Backend/README.md#config-variables) for detailed guidelines).
4. Run the development server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 2. Set Up the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

---

## Security Notice
All credentials, database connection strings, and Cloudinary keys are loaded securely through `.env` configurations and are ignored by version control to protect the production environments.
