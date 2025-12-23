# 🐾 PawsCare: NGO Attendance & Tracking System

[![Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)](https://github.com/jugal-ahir/PrayasMarked)
[![Tech Stack](https://img.shields.io/badge/Stack-Node--Express--MongoDB-blue?style=for-the-badge)](https://github.com/jugal-ahir/PrayasMarked)
[![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](LICENSE)

**PawsCare** is a sophisticated, glassmorphism-inspired web application designed for Animal Care NGOs to handle the end-to-end lifecycle of rescued animals. From mission Admission (Mark IN) to Recovery and Release (Mark OUT), PawsCare provides a unified platform for shelter management.

---

## 🚀 Key Features

### 🔐 Enterprise-Grade Auth & Roles
- **Secure Authentication**: JWT-based login for all staff.
- **Role-Based Access (RBAC)**:
    - **Staff**: Admission, tracking, and daily operations.
    - **Admin**: Advanced analytics, user registration, and data management.
- **User Initialization**: Dedicated server-side script for secure first-time admin creation.

### 🐕 Smart Admission & Tracking
- **Dynamic Species Engine**: Intelligent subspecies selection for Dogs, Cats, Birds, Turtles, and Rabbits.
- **Digital Medical Records**:
    - **Remarks**: Log illnesses, injuries, and health updates.
    - **Treatment Status**: Track "Treated" vs "Pending" status for every animal.
- **Operational Moves**: One-click transfer between **Treatment centers** and **Rehab centers**.
- **Quick Edit**: Instant correction of admission details without data loss.

### 📊 Admin Intelligence Dashboard
- **Real-Time Counters**: Instant visibility into current occupancy and daily movement.
- **Visual Analytics**: Dynamic progress bars showing occupancy trends across different centers.
- **Advanced Activity Logs**: 
    - Powerful search by Job ID, Species, or Volunteer.
    - Multi-parameter filtering (Date range, Destination, Status).
- **Data Export**: Generate and download **CSV reports** for specific date ranges—perfect for stakeholder reporting.

### 🎨 Premium User Experience
- **Modern UI**: Sleek glassmorphism design with a dark-mode focused aesthetic.
- **Animated UX**: Interactive intro animations and smooth layout transitions.
- **Mobile Optimized**: Fully responsive interface for tablets and smartphones.
- **Toast Notifications**: Real-time feedback for every action (admission, move, logout).

---

## 🛠️ Tech Stack

- **Frontend**: ![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) ![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) ![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) — *Custom SPA Architecture.*
- **Backend**: ![Node](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) — *RESTful API with JWT Security.*
- **Database**: ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) — *Mongoose-powered data persistence.*
- **Deployment**: Configured for PAAS like **Render** and **Vercel**.

---

## 📂 Project Architecture

```text
├── client/           # Custom Frontend SPA
│   ├── main.js       # Core Application Logic
│   ├── styles.css    # Design System & UI
│   └── index.html    # Entry Point
├── server/
│   ├── models/       # MongoDB Schemas (Animal & User)
│   ├── routes/       # Auth & Tracking API Endpoints
│   ├── middleware/   # JWT Verification
│   └── index.js      # Express Server Entry
├── .env              # Sensitive Configuration
├── vercel.json       # Vercel Deployment Schema
└── register-admin.js # Database Initialization Script
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/jugal-ahir/PrayasMarked.git
cd PrayasMarked

# Install dependencies
npm install

# Create .env file
# PORT=4000
# MONGO_URI=your_mongodb_atlas_url
# JWT_SECRET=your_security_key
# ADMIN_EMAILS=comma,separated,emails
```

### 3. Initialize Admin
```bash
# Update credentials in register-admin.js then run:
node register-admin.js
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 🤝 Contributing & Support

This project was built with a focus on animal welfare. If you'd like to contribute, please open a PR!

*Developed with ❤️ by [Jugal Vaghmashi](https://github.com/jugal-ahir).*


