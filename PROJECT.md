# Code Camp Workspace
### Immersive Productivity Dashboard & Creative AI Workspace

This repository contains **Code Camp Workspace**, an integrated, full-stack, local-persisting productivity workspace that unifies conversational ideation, structured document composition, and dynamic task planning into a single visual cockpit.

---

## 📌 Project Overview & Submission Link
*This document can be copied directly into your Google Doc submission for grading.*
* **Submission Google Doc Title:** `Code Camp Workspace - Project Submission`
* **Development Application URL:** https://ais-dev-ozfdos263qukb76vux2oyi-642914211559.asia-east1.run.app
* **Shared Production URL:** https://ais-pre-ozfdos263qukb76vux2oyi-642914211559.asia-east1.run.app
* **Author User Email:** rajputsriyansh67@gmail.com

---

## 🔍 1. Problem Statement Selected

### **The Cognitive Cost of Context-Switching in Knowledge Work**
In standard modern knowledge work, professionals, software engineers, and creators suffer from extreme **cognitive fragmentation**. To take a project from concept to delivery, users typically jump between three isolated software worlds:
1. **Isolated Conversational AI Playgrounds:** (e.g., standard ChatGPT/Gemini web interfaces) used for raw brainstorming and prompt drafting. These chats are short-lived, transient, and detached from execution files.
2. **Disconnected Document Editors:** (e.g., Google Docs, local markdown files) where draft copies, technical specifications, or newsletter copies are written. Re-prompting the AI requires copying/pasting back and forth.
3. **Detached Task boards / Kanban managers:** (e.g., Trello, Jira) where tasks are managed manually. Translating a high-level creative chat or document draft into 6-8 actionable task cards is a slow, error-prone manual chore.

This context-switching leads to:
* **Context Dilution:** Critical brainstorming details are forgotten between the chat interface and the task tracker.
* **Friction and Inertia:** The manual step of breaking down a large goal into granular task sub-items stalls action.
* **API Key Exposure Risk:** Users frequently copy sensitive API keys into unsecure, client-side browser extensions or untrusted client websites to get inline assistance.

---

## 💡 2. Solution Overview

**Code Camp Workspace** solves this fragmentation by building a unified, offline-resilient, full-stack visual cockpit that keeps ideation, document synthesis, and task execution inside a single, high-contrast dashboard. 

The application is engineered with a **local-first persistence architecture** combined with a **secure server-side Gemini gateway**:
* **The Unified Cockpit:** Unifies three key workflow panels (Co-Pilot Chat, Document Canvas, Planner Kanban Desk) with dynamic metrics and prebuilt template prompts.
* **AI Task Mapper:** Connects high-level themes to execution immediately. Instead of manually brainstorming task cards, the user inputs a project theme (e.g., *"Deploy full-stack React server to Cloud Run with environment variables"*), and the backend requests structured JSON from Gemini to automatically seed 6-8 custom Kanban cards with distinct priorities, efforts, and descriptive guidance.
* **Inline Markdown Refinement:** The document drafting space provides one-click contextual actions. Users can highlight/edit active documents and use Gemini to "Expand Depth", "Convert to Executive Tone", or "Generate Executive Summary" in-place.
* **Secure Token Separation:** The browser client has zero knowledge of the Gemini API Key. All requests are routed through a secure Node/Express backend (`server.ts`) which manages the official Google Gen AI SDK securely.

---

## ✨ 3. Key Features

### 📊 **I. Unified Studio Dashboard**
* **Real-Time Workspace Metrics:** Dynamic tracking of Session Generations (run counts), Saved Drafts, and Board Progress (tasks in-progress) using robust state synchronization.
* **Workflow Template Deck:** Fast-inject prompt cards ("Outline Technical Architectures", "SaaS Announcement Newsletters", "Creative Brand Slogans") that instantly transition the user into active chat.
* **Dynamic Studio Clock:** High-precision real-time clock paired with a live server connection check displaying connection health and API secret readiness.

### 💬 **II. Agentic Co-Pilot Chat Playground**
* **Specialized System Personas:** Instantly toggle between:
  1. *Creative Partner:* Ideal for drafting marketing copies, email newsletters, and content brainstorming.
  2. *Technical Architect:* Specializes in database design, ASCII diagrams, coding structures, and code reviews.
  3. *Socratic Scholar:* Interactive teaching profile that guides users through conceptual reasoning.
* **Advanced Controls:** Dynamically select target models (e.g., fast `gemini-3.5-flash` or analytical `gemini-3.1-pro-preview`) and slide the creativity temperature slider (from 0.1 precise up to 1.0 highly creative).
* **Local Message Cache:** Conversation states persist automatically to browser storage.

### 📝 **III. Document Canvas (Interactive Writer)**
* **Dual-Pane Setup:** Easily navigate through an archive of custom saved drafts while editing markdown code with live updates.
* **AI Assist Refinement Panel:**
  * *Expand:* Adds deep supporting details and professional examples.
  * *Executive Tone:* Upgrades the document structure to an authoritative, professional pitch.
  * *Summarize:* Automatically synthesizes key accomplishments and action bullets at the top of the document.

### 📋 **IV. Planner Desk (Interactive Kanban with AI Task Mapper)**
* **Structured AI Task Generation:** Solves task inertia. Input a project name, and Gemini generates a validated, structured JSON schema response, injecting the generated tasks right into the interactive Kanban Board columns.
* **Drag-and-Drop Column Progress:** Move task items smoothly between **Todo**, **In Progress**, and **Done** states.
* **Manual Add & Purge Controls:** Add custom tasks manually with target effort durations (e.g., `2h`, `1d`) and delete items on-the-fly.

---

## 🛠️ 4. Technologies Used

### **Frontend & Client Architecture**
* **Framework:** React 19 (Functional Components, custom Hooks for state/effects, robust layout control).
* **Language:** TypeScript (Strict type interfaces for `ChatMessage`, `KanbanTask`, `DocDraft`, and `AIProfile`).
* **Styling Engine:** Tailwind CSS (Custom ambient workspace theme, dark mode accents, zinc layouts, responsive mobile-first configurations).
* **Component Animation:** Motion React (Fluid route/tab transitions, slide-in sidebar dialogs, and button micro-states).
* **Icons:** Lucide React (Clean, vector-accurate icons for full visual cohesion).

### **Backend & Production Architecture**
* **Server Framework:** Node.js + Express v4 (Custom server for secure API forwarding).
* **Development Execution:** `tsx` (TypeScript Execute) for instant server booting.
* **Production Build Compiler:** `esbuild` to compile, bundle, and optimize the backend server into a single high-performance `dist/server.cjs` file, bypassing ES module relative path loading checks.
* **Client Persistence:** `localStorage` synchronization layer that bridges active frontend structures to browser storage securely.

---

## 🤖 5. Google Technologies Utilized

1. **Google Gemini API Server-Side:**
   Interacts directly with the official modern **`@google/genai` v2.4.0 SDK** to ensure robust compatibility, clean session handlers, and high-quality generation formatting.
2. **Gemini 3.5 Flash (`gemini-3.5-flash`):**
   Used as the default workhorse model. Handles quick conversational completions, markdown file expansion, and complex JSON-schema parsing tasks within milliseconds.
3. **Structured Output Model Control (`responseMimeType: 'application/json'`):**
   Utilized within the AI Task Mapper route to enforce strict output formatting. Gemini is instructed to respond exclusively with a JSON array adhering to the task schema, completely avoiding markdown wrapper pollution.
4. **Gemini 3.1 Pro (`gemini-3.1-pro-preview`):**
   Integrated as a secondary premium model target for heavy logical, architectural, and reasoning prompts.
5. **Google AI Studio Cloud Run Infrastructure:**
   Deployed securely in a production container on Google Cloud Run, utilizing the platform's isolated reverse proxy mapping to route secure internal calls safely.

---

## 📊 6. Workflow Diagrams

### **A. End-to-End Application Data Flow**
```
+---------------------------------------------------------------------------------+
|                                CLIENT BROWSER                                   |
|  +-------------------+    +----------------------+    +----------------------+  |
|  |  Dashboard view   |    |  Co-Pilot Chat view  |    | Document Canvas view |  |
|  +---------+---------+    +----------+-----------+    +----------+-----------+  |
|            |                         |                           |              |
|            +-------------------------+                           |              |
|                                      | User input prompt         | Refine text  |
|                                      v                           v              |
|                             [POST /api/gemini/chat]     [POST /api/gemini/generate]
|                                      |                           |              |
+--------------------------------------|---------------------------|--------------+
                                       |                           |
                                       v                           v
+---------------------------------------------------------------------------------+
|                               EXPRESS BACKEND SERVER                            |
|                            (Port 3000 / Cloud Run Host)                         |
|                                                                                 |
|  * Loads GEMINI_API_KEY from secure server environment secrets                  |
|  * Formats instruction payloads and initializes @google/genai SDK               |
+--------------------------------------|------------------------------------------+
                                       | Secure API Call
                                       v
+---------------------------------------------------------------------------------+
|                                GOOGLE GEMINI API                                |
|                                                                                 |
|  * Model processes prompt with designated System Instructions & Temperature     |
|  * Synthesizes and streams markdown content / JSON responses                    |
+---------------------------------------------------------------------------------+
```

---

### **B. Structured AI Task Mapper Process (Kanban Board Builder)**
```
+------------------+             +------------------------+             +------------------------+
|  User Types Goal |             |  Express Server API    |             |  Gemini 3.5 Flash Model|
|  e.g., "Deploy"  |             |  (/api/gemini/tasks)   |             |  (Structured Output)   |
+--------+---------+             +-----------+------------+             +-----------+------------+
         |                                   |                                      |
         | Formulates Theme                 | Formulates strict schema prompt      |
         +---------------------------------->+                                      |
         |                                   | Instructs responseMimeType: 'json'   |
         |                                   +------------------------------------->+
         |                                   |                                      | Generates JSON array
         |                                   |                                      | matching:
         |                                   |                                      | - title, description
         |                                   |                                      | - priority, status
         |                                   |                                      | - effort metrics
         |                                   |                                      |
         |                                   |<-------------------------------------+
         |                                   | Returns pure JSON raw string
         | Parses JSON and returns array     |
         |<----------------------------------+
         |
         | Maps items to Kanban board states
         | and saves to localStorage
         v
+------------------------+
| Render 6-8 Kanban      |
| Cards on Planner Desk  |
+------------------------+
```

---

## 🚀 7. Step-by-Step Local Deployment

To run this workspace locally, follow these simple steps:

### **1. Set up Environment Variables**
Create a `.env` file in the root directory:
```env
# Secure local API configuration
GEMINI_API_KEY="YOUR_ACTUAL_GOOGLE_AI_STUDIO_API_KEY"
PORT=3000
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Start the Development Server**
Runs the Express backend and Vite client server in parallel using unified TypeScript execution:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to experience the workspace!

### **4. Build for Production**
Compiles both frontend assets and the server bundle:
```bash
npm run build
npm start
```

---

### 🎨 Design & Craftsmanship Summary
The interface uses a **Deep Galactic Slate** palette (`bg-zinc-950`) contrasted with warm **Harvest Amber** accents (`text-amber-500`) to maximize focus and reduce eye strain over long development blocks. Negative space is handled generously, ensuring no telemetry or simulated log clutter interferes with user thoughts.
