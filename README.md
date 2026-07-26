# 🚗 AutoExpert — Digital Platform for Automotive Agencies

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-Automation-EA4B71?logo=n8n&logoColor=white)

A modern, responsive web platform that digitizes the day-to-day operations of an automotive agency — online appointment booking, a personal client area, satisfaction surveys, maintenance reminders, AI-assisted quotes, and a built-in assistant. Business processes (emails, confirmations, database writes, alerts) are fully automated end-to-end with **n8n** workflows, backed by a **Supabase** database.

> > Built during a 3-month application internship at **AHDIGITAL** (Technopark Agadir), July 2025. See the [Internship Report](#-internship-report) section below.

---

## ✨ Key Features

- **Home page** — immersive landing page presenting the agency, its services, testimonials, and performance stats.
- **Appointment booking (RDV)** — interactive calendar with real-time form validation; each booking is stored and triggers an automated confirmation email.
- **Client area (Espace Client)** — authenticated space to view upcoming appointments, browse intervention history, and modify or cancel bookings.
- **Satisfaction surveys** — star-based ratings and comments, with automatic alerts to the team on negative feedback.
- **Maintenance reminders** — vehicle-specific reminder requests handled by an automated workflow.
- **AI-assisted quotes (Devis)** — quote requests processed by an AI agent (Google Gemini) that generates tiered proposals (Basic / Standard / Premium) and emails them to the client.
- **Built-in assistant** — an in-app chatbot that guides visitors to the right page and service.

---

## 📸 Screenshots

> Add your images to a `docs/screenshots/` folder in the repo so they display below.

### Home page & assistant
<img  src="https://github.com/user-attachments/assets/d004e0ea-e176-4301-ae6d-517e6b1f2f1b" width="180" height="175" alt="Home page and chatbot" />
<img src="https://github.com/user-attachments/assets/f1001e80-46d6-4ec2-806c-7f583949ef60" width="180" height="175" alt="Home page and chatbot" />

*The landing page introduces the agency and its services. The built-in assistant (bottom-right) answers common questions and points visitors to the right page.*

### Client area — sign in & sign up
<img width="180" height="175" alt="login and registration " src="https://github.com/user-attachments/assets/1b7c63d3-dc41-40ec-8160-8f864193b872" />
<img width="180" height="175"  alt="Screenshot 2025-08-21 131656" src="https://github.com/user-attachments/assets/398bcddb-e914-4a4f-80ec-fa1ce4f689a7" />


*Clients create an account or log in to access their personal space, secured with Supabase authentication.*

### Client area — appointments & history
<img width="180" height="175" src="https://github.com/user-attachments/assets/393811b4-6938-4abb-a712-5dd31bfdbd1c" />
<img width="180" height="175" src="https://github.com/user-attachments/assets/9aff1a8f-37d1-4af6-aa43-bc850e48d8d8" />



*From "Mon Espace", clients view their upcoming appointments, browse their intervention history, and confirm, modify, or cancel a booking.*

### Requests — quote, satisfaction & maintenance



<img width="180" height="175" src="https://github.com/user-attachments/assets/cbf63cf2-b403-4172-b9e2-96c5e855803d" />

<img width="180" height="175"  src="https://github.com/user-attachments/assets/9dc4ad38-3501-4d00-a36f-a44b9a4a2ace" />

<img width="180" height="175" src="https://github.com/user-attachments/assets/e40747e9-eb72-4e5a-aa93-8fd439e29e5c" />





*Dedicated forms let clients request a personalized quote, rate a service, or ask for a maintenance reminder. Each submission is sent to an n8n workflow.*

### Automated response & admin database

<img width="180" height="175"  src="https://github.com/user-attachments/assets/5239571d-8ea9-46cc-b5d4-c0ace4fe53fc" />



*Every submission is confirmed to the client and stored automatically in the Supabase tables, giving the agency a live view of bookings, feedback, quotes, and maintenance requests.*
---

## 🛠️ Tech Stack

| Layer            | Technology                     | Role                                   |
| ---------------- | ------------------------------ | -------------------------------------- |
| Frontend         | React 18 + TypeScript          | Component-based user interface         |
| Build tool       | Vite                           | Fast dev server and optimized builds   |
| Styling          | Tailwind CSS + shadcn/ui       | Utility-first design system            |
| Icons            | Lucide React                   | Icon library                           |
| Database & Auth  | Supabase                       | PostgreSQL database and authentication |
| Automation       | n8n                            | Low-code workflow orchestration        |
| AI               | Google Gemini                  | AI agent for quote generation          |
| Email            | Gmail (via n8n)                | Automated confirmations & notifications |
| Version control  | Git / GitHub                   | Source control & deployment            |

---

## 🏗️ Architecture

The application follows a layered architecture:

- **Presentation layer** — React components styled with Tailwind CSS.
- **Application layer** — custom hooks and utility functions handling state and business logic.
- **Integration layer** — n8n webhooks and the Supabase client connecting the UI to backend services.
- **Persistence layer** — Supabase (PostgreSQL) for data, and Gmail for outgoing email.

Each user action (booking, cancellation, feedback, maintenance request, quote) posts to a dedicated n8n webhook, which validates the data, writes to Supabase, and sends the appropriate emails.

**Supabase tables:** `rendez_vous`, `feedback_clients`, `devis`, `demandes_maintenance`, `profiles`.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- A **Supabase** project (the client keys are configured in `src/integrations/supabase/client.ts`)
- An **n8n** instance (cloud or self-hosted) to run the automation workflows

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AbderKay/automoto-hub-38.git
cd automoto-hub-38

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start the development server
npm run dev
```

The app runs at `http://localhost:8080`.

### Environment variables

The n8n webhook URLs are configured in `src/utils/n8nApi.ts`. For production, create a `.env.local` file at the project root and set your own webhook endpoints:

```env
VITE_N8N_WEBHOOK_MODIFICATION=https://your-n8n-instance.com/webhook/modification
VITE_N8N_WEBHOOK_CONTACT=https://your-n8n-instance.com/webhook/contact
VITE_N8N_WEBHOOK_DEVIS_PDF=https://your-n8n-instance.com/webhook/devis-pdf
```

> Note: several webhook URLs currently point to `http://localhost:5678` (a local n8n instance). Update them to your deployed n8n endpoints before going live.

---

## 📜 Available Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the development server                 |
| `npm run build`     | Build the app for production (`dist/` folder)|
| `npm run build:dev` | Build in development mode                     |
| `npm run preview`   | Preview the production build locally          |
| `npm run lint`      | Run ESLint                                    |

---

## 📁 Project Structure

```
automoto-hub-38/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images (e.g. luxury-car background)
│   ├── components/
│   │   ├── Chatbot/        # In-app assistant widget
│   │   ├── Layout/         # Header, Footer, Layout
│   │   ├── ui/             # shadcn/ui components
│   │   └── DevisForm.tsx   # Quote request form
│   ├── pages/              # Index, Auth, EspaceClient, Rdv,
│   │                       #   Satisfaction, Maintenance, NotFound
│   ├── hooks/              # Custom React hooks
│   ├── integrations/
│   │   └── supabase/       # Supabase client & types
│   ├── utils/              # n8n API helpers
│   ├── App.tsx
│   └── main.tsx
├── supabase/               # Database config & migrations
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 🔄 n8n Workflows

Six automated workflows power the platform:

| Workflow      | Webhook path              | Automated actions                          |
| ------------- | ------------------------- | ------------------------------------------ |
| Reservation   | `/webhook/reservation`    | Store booking, confirmation email          |
| Modification  | `/webhook/modification`   | Team notification, follow-up               |
| Cancellation  | `/webhook/cancel-reservation` | Free the slot, confirmation email      |
| Satisfaction  | `/webhook/feedback`       | Store rating, alert on negative reviews    |
| Maintenance   | `/webhook/maintenance-reminder` | Store request, schedule reminders    |
| Quote (Devis) | `/webhook/devis`          | AI-generated quote, email to client        |

The workflow JSON files can be imported into n8n via **Workflows → Import from file**, then configured with your own Supabase and Gmail credentials.

---

## 🌐 Deployment

The project is a static Vite single-page app and can be deployed to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

```bash
# Build for production
npm run build

# The dist/ folder is ready to deploy
```

On Vercel or Netlify, connect the GitHub repository and the platform will build and deploy automatically on each push. Remember to configure your production environment variables (n8n webhook URLs) in the hosting platform's settings.

---

## 📄 Internship Report

This project was developed as part of a one-month application internship and documented in a full report.






📎📎 **[Read the full internship report (PDF)](docs/Rapport_Stage_AutoExpert.pdf)**

| | |
| --- | --- |
| **Title** | Development of an innovative web solution for automotive agencies: digitalization, automation, AI chatbot and its database (AutoExpert) |
| **Company** | AHDIGITAL — Technopark Agadir |
| **Period** | July 1 – oct1, 2025 |

The report covers the context and objectives, system analysis and design (UML, architecture), the technical implementation (React, Tailwind, n8n workflows, Supabase), results and performance metrics, challenges encountered, and future perspectives.

---

## 👥 Authors

- **Abderrahman Kayouh** — [@AbderKay](https://github.com/AbderKay)
- **Amine Charrou**

---

## 📝 License

This project was developed for educational purposes as part of an academic internship.
