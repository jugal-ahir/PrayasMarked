# 🐾 PrayasMarked: NGO Attendance & Tracking System

[![Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)](https://github.com/jugal-ahir/PrayasMarked)
[![Tech Stack](https://img.shields.io/badge/Stack-Node--Express--MongoDB-blue?style=for-the-badge)](https://github.com/jugal-ahir/PrayasMarked)
[![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](LICENSE)

**PrayasMarked** is a high-fidelity, glassmorphism-inspired web application designed for Animal Care NGOs to manage the entire lifecycle of rescued animals. From initial admission (**Mark IN**) to medical recovery and final release (**Mark OUT**), PrayasMarked provides a streamlined, digital-first platform for shelter operations.

---

## 🌟 Key Features

### 🔐 Enterprise-Grade Security
- **JWT-Based Authentication**: Secure login system for all staff and administrators.
- **Role-Based Access Control (RBAC)**:
    - **Staff**: Manage daily admissions, health tracking, and operational moves.
    - **Admin**: Access advanced analytics, manage users, and export critical data.
- **Secure Initialization**: Dedicated script for first-time admin setup.

### 🐕 Intelligent Tracking Engine
- **Smart Species Selector**: Context-aware subspecies selection for Dogs, Cats, Birds, Turtles, and Rabbits.
- **Digital Health Records**: Log comprehensive medical remarks, treatment statuses, and recovery milestones.
- **Operational Agility**: One-click transfers between **Treatment Centers** and **Rehabilitation Zones**.
- **Real-Time Job Indexing**: Automatic Generation of Job IDs for every rescue mission.

### 📊 Admin Intelligence & Reporting
- **Real-Time Dashboard**: Instant visibility into shelter occupancy and daily movement via interactive counters.
- **Visual Analytics**: Dynamic progress bars showing occupancy trends across different centers.
- **Audit-Ready Logs**: Powerful search and multi-parameter filtering (Date, Species, Volunteer).
- **Data Portability**: Generate and download **CSV reports** for stakeholder reporting and compliance.

### 🎨 Premium UI/UX Experience
- **Glassmorphism Design**: Modern, sleek aesthetic with a focus on dark-mode usability.
- **Fluid UX**: Interactive entry animations and smooth transitions between modules.
- **Mobile-First Responsive**: Tailored experience for on-field volunteers using smartphones and tablets.
- **Action Feedback**: Real-time toast notifications for system-wide transparency.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) |
| **DevOps** | ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) |

---

## 📂 Project Architecture

```text
├── client/           # High-Fidelity Frontend SPA
│   ├── main.js       # Central Application Logic
│   ├── styles.css    # Global Design System
│   └── index.html    # Application Entry
├── server/
│   ├── models/       # Data Schemas (Animal, User, Medical)
│   ├── routes/       # RESTful API Endpoints
│   ├── middleware/   # Security & JWT Verification
│   └── index.js      # Server Entry Point
├── register-admin.js # Database Bootstrapping Script
└── .env.example      # Environment Configuration Template
```

---

## ⚙️ Quick Start

### 1. Installation
```bash
git clone https://github.com/jugal-ahir/PrayasMarked.git
cd PrayasMarked
npm install
```

### 2. Configuration
Create a `.env` file in the root directory:
```env
PORT=4000
MONGO_URI=your_mongodb_cluster_url
JWT_SECRET=your_secure_secret_key
ADMIN_EMAILS=admin@example.com
```

### 3. Initialize & Run
```bash
# Initialize the first administrator
node register-admin.js

# Start the development server
npm run dev
```

---

## 📄 Project Deliverables
- **Final Report**: [Final_Report.pdf](./Final_Report.pdf) (See LaTeX source in `Final_Report.tex`)
- **Survey Analysis**: Appendix of the final report contains user feedback data.

## 🤝 Contributing
Contributions are what make the open-source community an amazing place. Any contributions you make are **greatly appreciated**. If you have a suggestion that would make this better, please fork the repo and create a pull request.

Developed with ❤️ by [Jugal Vaghmashi](https://github.com/jugal-ahir).


