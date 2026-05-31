# 🚀 Stash-N-Grab

**Stash-N-Grab** is a high-performance Curriculum Studio and Mastery Vault built for proof-of-knowledge learning.

Unlike traditional learning platforms that reward passive completion, Stash-N-Grab enforces a strict **Gatekeeper System** where curriculum progress and XP remain locked until a learner demonstrates mastery by successfully passing module-specific examinations.

---

## 🕹️ Core Mechanics

```text
[ Browse Paths ]
        │
        ▼
[ Grab & Stash ]
        │
        ▼
[ Complete Resources ] ──► Maintains Streak 🔥
        │
        ▼
[ Pass Gatekeeper Exam ] 🧠
        │
        ▼
[ Earn 50 XP ]
        │
        ▼
[ Showcase Profile ]
```

### 1. The Resource Wall

Marking reading material, videos, or documentation as completed **does not grant XP or path progress**. Resources act only as bookmarks and prerequisites for unlocking exams.

### 2. The Gatekeeper Exam

The **only source of progress, XP, and level advancement**. Learners must prove mastery before progressing.

### 3. Immutable Rewards

Earned XP and levels are permanently recorded. If a creator later edits, restructures, or deletes a path, the learner's historical achievements remain untouched.

---

## ✨ Key Feature Suites

### 🏗️ Architect Mode (Creator Suite)

* **Path Construction** — Build complex learning paths using nested modules, descriptions, and resource collections.
* **Live Mutations** — Update curriculum content and configuration in real time without disrupting learner progress.
* **Gatekeeper Builder** — Create and manage MCQ challenge pools for every module.

### 🛡️ Mastery & Validation (Learner Suite)

* **High-Stakes Progress** — Progress bars reflect only verified knowledge.
* **Streak Calibration** — Timezone-safe interaction tracking keeps daily streaks accurate.
* **Anti-Brute Force Mechanics** — Failed exams trigger a reset flow requiring resource review before another attempt.

### 🌐 Social & Discovery Core

* **Public Showcases** — Share rank cards, XP ledgers, trophy rooms, and stashed paths.
* **Bayesian Weighted Discovery** — Prevents paths with only a few ratings from outranking heavily reviewed content.
* **Vault Stashing** — Clone curriculum structures directly into a personal learning workspace.

### 🎨 Fluid Architecture (UI/UX)

* **Mode-Adaptive Rendering** — Instantly switch between clean Document Mode and neon-accented Vault Mode.
* **Spring-Physics Transitions** — Smooth animations powered by Framer Motion's layout and spring systems.

---

## 🛠️ Tech Stack

| Layer          | Technology              | Purpose                                    |
| -------------- | ----------------------- | ------------------------------------------ |
| Framework      | Next.js 14 (App Router) | Server Components, Streaming, Edge Routing |
| Language       | TypeScript              | Strict Typing & Interface Safety           |
| Database       | MongoDB + Mongoose      | Data Persistence & Analytics               |
| Authentication | NextAuth.js             | OAuth via Google & GitHub                  |
| Styling        | Tailwind CSS            | Utility-First Responsive UI                |
| Animation      | Framer Motion           | Layout & Interaction Animations            |

---

## 📂 Project Structure

```text
├── app/
│   ├── api/
│   │   ├── collections/      # CRUD endpoints & search aggregation
│   │   ├── resource/         # Bookmark states & streak logic
│   │   └── user/             # XP registers & profile state
│   └── profile/              # Dynamic user profile routes
│
├── components/               # UI components
├── lib/                      # DB connectors, auth config, middleware
└── models/                   # Mongoose schemas
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/amangh30/stash-n-grab.git
cd stash-n-grab
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

### 4. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🎯 Design Philosophy

Stash-N-Grab is built around a simple principle:

> Progress should be earned through demonstrated understanding, not passive consumption.

Every architectural decision—from Gatekeeper Exams to immutable XP records—supports a mastery-first learning experience where achievements represent verified knowledge rather than completed checklists.

---

## 📈 Future Roadmap

* Adaptive exam difficulty
* Learning analytics dashboards
* Team learning workspaces
* AI-assisted curriculum generation
* Skill-based recommendation engine
* Achievement and badge ecosystem
