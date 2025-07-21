
# 🏥 MedManager Pro

> Your all-in-one Medical Management Platform for Clinics, Doctors, and Patients.

🚀 **Live Link:** [https://mmp-2-l8fv.vercel.app/](https://mmp-2-l8fv.vercel.app/)

🧠 Built with MERN Stack + Google Auth + Vercel | A capstone project by [Rohan Singh Jaglan](https://github.com/rohansinghjaglan)

---

## 🧩 Features

- 👨‍⚕️ Doctor & Patient Portals
- 📋 Appointment Scheduling System
- 📁 Patient Medical History Management
- 🧠 **AI-powered Skin Disease Analyzer** (Beta)
- 🔐 Google Authentication
- ⚙️ Admin Panel for System Control
- 📅 Responsive Calendar for Bookings
- 🌐 Deployed on Vercel with Production-ready UI
- 💳 Razorpay Payment Gateway

---

## 🛠️ Tech Stack

- **Frontend:** React.js, TailwindCSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Cloud)
- **Authentication:** Google , Razorpay
- **Deployment:** Vercel
- **AI Integration:** Skin Analyser 

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/kalviumcommunity/S64_Rohan_Capstone_MManager.git
cd S64_Rohan_Capstone_MManager
```

---

## ⚙️ Running the App Locally

### 1. Install Dependencies:

#### For Frontend:
```bash
cd frontend
npm install
```

#### For Backend:
```bash
cd ../backend
npm install
```

---

### 2. Environment Variables

Create `.env` files in both `/frontend` and `/backend` folders:

#### Example `.env` for Backend:
```env
MONGO_URI=your_mongodb_uri
PORT=5000
```

#### Example `.env` for Frontend:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_BASE_URL=http://localhost:5000
```

---

### 3. Run Backend Server:
```bash
cd backend
npm start
```

### 4. Run Frontend App:
```bash
cd frontend
npm run dev
```

---

## ✨ Highlight Feature: Skin Disease Analyzer 🧬

An integrated AI-based skin condition detector allows users to upload skin images and get **possible disease predictions** instantly. This is still in **Beta Phase** and will improve over time with enhanced datasets and deep learning.

> Try it from the main navigation → "Skin Analyzer" section


## 📁 Folder Structure

```
S64_Rohan_Capstone_MManager/
├── frontend/
│   ├── src/
│   ├── public/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
```

---

## 🤝 Contributions

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 🙋‍♂️ Author

Built with 💙 by [Rohan Singh Jaglan](https://github.com/rohansinghjaglan)

---


