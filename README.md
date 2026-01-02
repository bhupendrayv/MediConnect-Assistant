# Smart Healthcare Appointment & Diagnosis Assistant

A complete MERN stack application for healthcare management, featuring patient appointment booking, doctor dashboards, and AI-based symptom diagnosis.

## Features

- **Patient**:
  - Register & Login
  - Book Appointments with Doctors
  - Check Symptom Diagnosis (AI Helper)
  - View Appointment History & Notifications

- **Doctor**:
  - Manage Profile & Availability
  - View & Approve/Reject Appointments

- **Admin**:
  - Manage Users & Doctors
  - Approve Doctor Applications

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Ant Design, Redux Toolkit
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed or Atlas URI

### 1. Backend Setup

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` file:
   - Ensure `MONGO_URI` is correct.
4. Start the server:
   ```bash
   npm start
   # or
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

- `POST /api/v1/user/register` - Register user
- `POST /api/v1/user/login` - Login user
- `POST /api/v1/user/book-appointment` - Book appointment
- `POST /api/v1/user/predict-disease` - AI Diagnosis
- `GET /api/v1/admin/getAllDoctors` - Get doctor list

## Folder Structure

- `/client`: React Frontend
- `/server`: Express Backend
  - `/models`: Database Schemas
  - `/controllers`: Logic
  - `/routes`: API Routes
  - `/utils`: Helper functions (AI Logic)

## Troubleshooting

- If `npm` commands fail, ensure Node.js is added to your system PATH.
- Ensure MongoDB is running on port 27017 or update `.env`.
