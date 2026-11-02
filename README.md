# Telemedicine Healthcare Portal

A comprehensive telemedicine platform featuring role-based access control (RBAC), real-time healthcare analytics, pharmacy inventory management, and an AI-powered symptom checker.

## Getting Started

Follow these steps to set up the project on your local machine after cloning.

### Prerequisites
- **Node.js** (v16+)
- **Python** (3.8+)
- **MongoDB** (Running on `localhost:27017`)

---

### Setup Instructions

Open three separate terminals to run each component.

#### 1. Backend Server
```bash
cd backend
npm install
node server.js
```
*The server will connect to MongoDB and automatically seed the `telemedicine` database with sample data.*

#### 2. Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*The dashboard will be available at `http://localhost:5174` (or the port shown in your terminal).*

#### 3. AI Symptom Service
```bash
cd ai_service
# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

---

### Test Accounts
You can use the following pre-seeded accounts to explore the different role-based views:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@telemedicine.com` | `password123` |
| **Doctor** | `doctor@telemedicine.com` | `password123` |
| **Patient** | `patient@telemedicine.com` | `password123` |
| **Pharmacy** | `pharmacy@telemedicine.com` | `password123` |

---

## Features
- **Dashboard Visuals**: Real-time trend charts and activity cards.
- **Privacy Engine**: Users only see their own health data/trends.
- **Pharmacy Management**: Track stock levels and medicine dosages.
- **Smart Auth**: Intelligent redirection between Login and Registration.
- **Video Consultations**: WebRTC-powered consulting rooms.

## 📦 Deployment
The current development branch is `moni-dev`.
