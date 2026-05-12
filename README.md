# 🚀 Stash-N-Grab

**Stash-N-Grab** is a high-performance Curriculum Studio and Mastery Vault. Unlike traditional learning platforms where progress is gained by simple clicks, Stash-N-Grab utilizes a **Gatekeeper System**: progress and XP are only unlocked once a user proves their knowledge through section-specific exams.

## ✨ Key Features

### 🏗️ Architect Mode

* **Path Construction**: Create complex learning paths with nested modules and resources.
* **Live Editing**: Owners can update titles, descriptions, and resource links in real-time without resetting student XP.
* **Gatekeeper Builder**: Integrated MCQ exam creator for every module to verify learner mastery.

### 🛡️ Mastery & XP System

* **Proof of Knowledge**: Progress bars and XP are tied strictly to passing exams.
* **Streak Logic**: Maintain a daily burn 🔥 by interacting with resources.
* **Immutable XP**: Hard-earned levels stay on the user profile even if the curriculum architecture changes.

### 🌐 Social & Discovery

* **Public Profiles**: Showcase your Level, XP, Trophy Room, and stashed paths to the community.
* **Weighted Discovery**: A search algorithm that ranks paths based on a Bayesian weighted average of community ratings.
* **Vault Stashing**: One-click "grabbing" of paths to save them to your active learning dashboard.

### 🎨 Elite UI/UX

* **Mode-Adaptive**: Seamlessly transitions between a professional "Document" Light Mode and a high-tech "Vault" Dark Mode.
* **Fluid Motion**: Powered by Framer Motion for spring-physics animations and layout transitions.
* **Sticky Mastery**: Always-visible progress tracking that follows the learner through the path.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
* **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Google & GitHub Providers)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/amangh30/stash-n-grab.git
cd stash-n-grab

```

### 2. Install dependencies

```bash
npm install

```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add the following:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret

```

### 4. Run the development server

```bash
npm run dev

```

---

## 📂 Project Structure

* `/app`: Next.js 14 routes and API endpoints.
* `/api/collections`: CRUD operations for curriculum paths.
* `/api/user`: XP, Streaks, and Profile logic.


* `/components`: Reusable UI components (Architect Mode, Curriculum Viewer, Collection List).
* `/models`: Mongoose schemas for Users, Collections, Sections, and Ratings.
* `/lib`: Core utility functions, MongoDB connection, and Auth configurations.
