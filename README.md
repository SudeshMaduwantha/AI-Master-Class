# AI Master Class 🎓

**AI Master Class** is a modern, AI-powered platform designed for educators to manage students, classes, and learning materials efficiently. It leverages **Google Drive** for data storage and **Google Gemini AI** for intelligent content generation.

![Dashboard Preview](https://via.placeholder.com/800x400?text=AI+Master+Class+Dashboard) *Add a screenshot here*

## 🚀 Key Features

### 🧠 AI & Learning
*   **AI Quiz Generator**: Instantly generate Multiple Choice and Short Answer quizzes from **PDFs**, **URLs**, or **Text** using Gemini AI.
*   **AI Tutor**: A context-aware chatbot that helps students understand course material, answering questions based on uploaded notes.
*   **Interactive Student Quizzes**: A dedicated, engaging interface for students to take quizzes with **instant grading**, visual feedback, and confetti celebrations for high scores.

### 📊 Management & Administration
*   **Student Management**: customized CRUD system to track student enrollments, payments (`Paid`/`Pending`), and class assignments.
*   **Class & Fee Tracking**: Manage class schedules and set fees.
*   **Attendance System**: Easy-to-use digital attendance tracker that saves daily records to Google Drive.
*   **Quiz Results Dashboard**: Track how students are performing with a real-time scoreboard for every quiz.

### ☁️ Google Drive Integration
*   **Zero Database Cost**: All data (Student lists, Quizzes, Results, Attendance) is stored directly in your **Google Drive** as JSON files.
*   **Full Ownership**: You own your data. No lock-in.
*   **File Management**: Browse, upload, and organize class recordings and materials directly from the app.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling**: CSS Modules with Glassmorphism Design System & [Lucide React](https://lucide.dev/) Icons.
*   **AI**: [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`).
*   **Storage/Database**: [Google Drive API](https://developers.google.com/drive) (`googleapis`).
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Google Provider).
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti).

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/SudeshMaduwantha/AI-Master-Class.git
    cd AI-Master-Class
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables**
    Create a `.env.local` file in the root directory and add the following credentials:
    ```env
    # Google OAuth (for Auth & Drive API)
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # NextAuth
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_random_secret_string

    # Gemini AI
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    ```
    *Note: You need to enable **Google Drive API** in your Google Cloud Console.*

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it.

## 🌍 Deployment

The easiest way to deploy is using **Vercel**.

1.  Push your code to a GitHub repository.
2.  Import the project into Vercel.
3.  Add the environment variables from step 3 into Vercel's settings.
4.  **Important**: Update your Google Cloud Console "Authorized Javascript Origins" and "Redirect URIs" to include your new Vercel domain (e.g., `https://your-app.vercel.app`).

## 📁 Project Structure

*   `/src/app/masterclass`: Main application routes.
    *   `/quiz`: Quiz Generator & AI Tutor.
    *   `/students`: Student Management.
    *   `/attendance`: Attendance Tracker.
    *   `/quizzes`: Quiz Results & Management.
    *   `/student/quiz/[id]`: Student-facing Quiz Interface.
*   `/src/lib`: Helper functions for Drive and Gemini.
*   `/src/components`: Reusable UI components (Sidebar, GlassCards, etc.).

---

Developed with ❤️ by Sudesh Maduwantha.
