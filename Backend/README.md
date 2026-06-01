# MERN Resume Analyzer - Backend Server

The backend server is a robust Node.js Express REST API that handles user authentication, file uploads, document parsing, matching algorithms, and background task processing.

---

## 🛠️ Technology Stack
* **Runtime**: Node.js (ES Modules, `"type": "module"`)
* **Framework**: Express.js
* **Database**: MongoDB (via Mongoose ODM)
* **Storage Provider**: Cloudinary (uploaded via Multer buffers as `raw` files)
* **File Parsers**: `pdf-parse` (for PDF text) and `mammoth` (for DOCX XML extraction)

---

## 🔑 Environment Configurations

Create a `.env` file in the `Backend` directory containing:

```env
PORT=5000
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_key
FRONTEND_URL=http://localhost:3000

# Cloudinary Integration
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

---

## 💾 Database Schemas & Schema Models

### 1. `User`
Manages account registration, secure hashed passwords (using `bcryptjs`), and session controls.

### 2. `Resume`
Tracks uploaded documents. Stores:
* Cloudinary URLs and public IDs.
* Parsed candidate metadata (name, email, phone).
* Detected skills array.
* Extracted experience and education items.
* ATS scores and structured guidelines suggestions.

### 3. `JobQueue`
A MongoDB-backed task management collection. Drives the asynchronous processing loops, marking tasks as `pending`, `processing`, `completed`, or `failed`.

### 4. `JobAnalysis`
Links a resume to a specific job description. Calculates the match index, keyword comparisons, and builds tailored resume guidelines.

---

## 🔌 API Reference Routes

### Authentication (`/api/auth`)
* `POST /api/auth/signup` - Register a new user.
* `POST /api/auth/login` - Authenticate a user and sign JWT tokens.
* `GET /api/auth/profile` - Retrieve the currently authenticated user's details.

### Resumes (`/api/resumes`)
* `POST /api/resumes/` - Upload a resume document (PDF/DOCX) using Multer. Enqueues a background parser task.
* `GET /api/resumes/` - Retrieve all resumes uploaded by the authenticated user.
* `GET /api/resumes/:id` - Fetch details for a specific resume.
* `GET /api/resumes/:id/file` - Proxy stream files directly from Cloudinary to bypass CORS canvas limitations.
* `DELETE /api/resumes/:id` - Purge a resume from MongoDB and Cloudinary.

### Analysis (`/api/analysis`)
* `POST /api/analysis/` - Compare a resume against a job description. Enqueues a matching job task.
* `GET /api/analysis/` - Retrieve historical job analysis runs.
* `GET /api/analysis/:id` - Fetch comparative analysis metrics by ID.

---

## ⚙️ Background Queue Processing
The server runs an asynchronous interval worker (`startQueueWorker`) inside a background thread loop. The worker:
1. Polls for `pending` jobs inside the MongoDB `JobQueue` collection.
2. Marks the job as `processing`.
3. Performs resource-heavy tasks (downloading files from Cloudinary, extracting PDF/Word text structure, running local keyword-matching engines).
4. Updates the model status (`completed`/`failed`) and stores the completed metadata payload.
5. Employs a robust error-handler block to prevent server crashes on queue exceptions.
