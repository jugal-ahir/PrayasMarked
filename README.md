# 🐾 Animal Care NGO Attendance System

[![Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)](https://github.com/jugal-ahir/PrayasMarked)
[![Tech Stack](https://img.shields.io/badge/Stack-Node--Express--MongoDB-blue?style=for-the-badge)](https://github.com/jugal-ahir/PrayasMarked)
[![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](LICENSE)

An elegant, production-ready attendance and tracking system built for animal care NGOs. Manage animal admissions, track their locations, and maintain detailed logs with ease.

---

## ✨ Key Features

### 🔐 Secure Roles
- **Staff (User)**: Streamlined interface to mark animals **IN** and **OUT**.
- **Admin**: Full access + centralized dashboard with advanced analytics, filters, and logs.

### 🐕 Intelligent Tracking
- **Auto-Generated IDs**: Unique IDs (e.g., `DOG-20251217-XYZ12`) assigned to every admission.
- **Real-time Status**: INSTANTLY see who is currently in the shelter vs. who has been released.
- **Move Feature**: Seamlessly transfer animals between "Treatment Center" and "Rehab Center".

### 📊 Advanced Analytics & Logs
- **Dynamic Search**: Filter by ID, Species, Incharge Person, or Date.
- **Activity Stats**: Visual progress bars and counters for daily and total activity.
- **Export (Admin)**: Export tracking data to CSV for reporting (Coming Soon).

---

## 🛠️ Tech Stack

- **Frontend**: ![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) ![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) ![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) — *Vanilla SPA with Glassmorphism UI.*
- **Backend**: ![Node](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) — *High-performance REST API.*
- **Database**: ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) — *NoSQL for flexible animal records.*

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/jugal-ahir/PrayasMarked.git
cd PrayasMarked
npm install
```

### 2. Configure Environment
Create a `.env` file in the root:
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
ADMIN_EMAILS=vaghmashijugal@gmail.com
```

### 3. Register First Admin
Since registration is disabled for security, use the initialization script:
1. Edit `register-admin.js` with your desired credentials.
2. Run: 
   ```bash
   node register-admin.js
   ```

### 4. Launch Project
```bash
npm run dev
```

---

## 📂 Project Structure

```text
├── client/           # Frontend SPA (Vanilla JS, CSS, HTML)
├── server/
│   ├── models/       # Mongoose Schemas (User, Animal)
│   ├── routes/       # API Router (Auth, Tracking)
│   └── middleware/   # Auth Protection
├── .env              # Secrets (ignore in Git)
├── vercel.json       # Deployment config
└── register-admin.js # Initial setup script
```

---

## ☁️ Deployment

Built to work out-of-the-box on **Render** (Monolith) or **Vercel** (Split). See [walkthrough.md](file:///C:/Users/ASUS/.gemini/antigravity/brain/394276e5-5996-4ed7-9567-90ebafdb5a26/walkthrough.md) for detailed steps.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---
*Developed with ❤️ for Animal Welfare.*


