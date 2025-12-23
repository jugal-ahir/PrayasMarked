## Animal Care NGO – Attendance & Tracking System

This project is a small, production-ready web app to help an animal care NGO track animals marked **IN** and **OUT** of shelters, treatment centers, and rehab centers.

### Features

- **Roles**
  - Normal user: mark animals IN and OUT.
  - Admin: all user permissions + centralized logs view with search and filters.
- **Animal identification**
  - Each IN entry receives a system-generated **Animal ID** (e.g. `DOG-20251217-XYZ12`).
  - ID is visible on cards and searchable in logs.
- **Mark IN**
  - Select species, destination, and IN date/time.
  - User name auto-filled from the top-right input.
  - Stored in MongoDB and shown under “Marked IN Animals”.
- **Mark OUT**
  - Any user can mark OUT any IN animal.
  - OUT time and user auto-logged.
  - Card moves from **IN** to **OUT** column.
- **Logs**
  - Search by Animal ID, species, user, date range, status, and destination.
  - Separate IN/OUT columns in the Logs view.

### Tech stack

- **Backend**: Node.js, Express, Mongoose (MongoDB)
- **Frontend**: Vanilla JS SPA served by Express
- **Database**: MongoDB

### Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   Create a `.env` file in the project root with:

   ```bash
   MONGO_URI=mongodb://localhost:27017/animal_care_ngo
   PORT=4000
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

   Then open `http://localhost:4000` in your browser.

### Structure

- `server/index.js` – Express app, MongoDB connection, and static file serving.
- `server/models/Animal.js` – Mongoose model for animal entries.
- `server/routes/animals.js` – IN/OUT endpoints and logs with search/filters.
- `client/` – Frontend (HTML/CSS/JS) with:
  - `Dashboard` (IN form, IN list, OUT list)
  - `Logs` (search bar, filters, IN/OUT logs)

### Notes

- This project is intentionally small and modular so it can be extended with authentication, user persistence, and role-based access control later on.


