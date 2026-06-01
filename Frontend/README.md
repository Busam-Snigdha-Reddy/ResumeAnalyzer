# MERN Resume Analyzer - Frontend Client

A responsive React single page application built on Vite, styled with sleek dark-mode glassmorphic aesthetics.

---

## 🛠️ Technology Stack
* **Bundler/Build Engine**: Vite (React)
* **Icons**: `lucide-react`
* **HTTP Requests**: `axios` (configured with central base instances and JWT authorization interceptors)
* **Canvas Parser**: `pdfjs-dist` (loads PDF structures in-memory to extract coordinates and text layers)
* **Styling**: Premium custom Vanilla CSS (located in `src/index.css`)

---

## 🎨 Interactive Canvas Overlay (`ResumeCanvasOverlay`)
The interface features a custom interactive rendering overlay:
1. **Dynamic Renders**: Downloaded PDFs are rendered directly inside HTML `<canvas>` elements using PDF.js at High-DPI scale (1.5x).
2. **Text Layer Extraction**: The component extracts coordinate layout boxes (`tx`, `ty`, `width`, `height`) for all parsed lines.
3. **Coordinate-Mapping Highlights**: Discovered ATS errors, keyword suggestions, or layout formatting flags are mapped directly to corresponding text coordinates and rendered as floating transparent highlights.
4. **Interactive Tooltips**: Hovering over highlights triggers contextual popovers indicating critical severity (high/medium/low) and bullet-point suggestions.
5. **Fallback Flow**: If PDF.js encounters a non-PDF document (like DOCX files), the viewer gracefully falls back to an HTML paper view with embedded textual highlights.

---

## 📂 Navigation & View Pages

### 1. Welcome Landing (`Landing.jsx`)
Features a dark theme banner, gradient hero typography, quick CTA controls to register/login, and interactive glassmorphic feature grids.

### 2. Main Dashboard (`Dashboard.jsx`)
Exposes quick aggregated stats (Total Resumes, Average ATS Score, and Tailoring Simulations), lists active documents with current status, and shows comparative tailoring histories.

### 3. Upload Center (`UploadPage.jsx`)
A drag-and-drop file upload workspace that displays real-time processing indicators while the backend queue parses the elements.

### 4. Analysis Suite (`AnalysisResult.jsx`)
Splits the layout into the visual canvas overlay on the left and a tabbed control dock on the right:
* **ATS Evaluation**: Shows gauge rings (ATS, Formatting, and Action Verbs) and lists critical suggestions.
* **Tailoring Engine**: Form to paste job description keywords. Generates comparison matches, missing indexes, and recommendations.
* **Role Simulator**: Provides an interactive mock interview coach that pulls questions mapped directly from the user's missing skills matrix.

---

## 💎 Custom Styles Design System (`src/index.css`)
To keep the application highly responsive without Tailwind bundler dependencies, the layout utilizes custom vanilla utility classes:
* **Transitions**: Smooth HSL transforms on button interactions (`active:scale-[0.98]`, `hover:scale-[1.03]`).
* **Gradients**: Modern linear gradients for active panels and call-to-actions (`bg-gradient-to-r.from-violet-600.to-indigo-600`).
* **Glassmorphism**: Backdrop blur overlays with sub-pixel borders (`bg-slate-900/40 backdrop-blur-md border-slate-800/80`).
