# 🎒 Campus Lost & Found Platform

An AI-powered full-stack web application designed for college campuses to simplify reporting, tracking, and recovering lost and found items. The platform uses **Jina AI semantic embeddings** to intelligently match lost and found reports based on their descriptions, helping users recover belongings more efficiently.

## ✨ Features

- 🤖 AI-powered semantic matching using Jina AI Embeddings
- 🔐 JWT-based user authentication and authorization
- 📦 Report lost and found items with images
- ☁️ Image upload and storage using Cloudinary
- 💬 Real-time chat between owners and finders using Socket.IO
- ✅ Multi-step ownership verification before claiming items
- 📱 Responsive and user-friendly interface built with React and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB & Mongoose
- JWT Authentication

### Services
- Jina AI (Semantic Embeddings)
- Cloudinary (Image Storage)

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/campus-lost-and-found.git
cd campus-lost-and-found
```

### Install dependencies

**Backend**
```bash
cd server
npm install
```

**Frontend**
```bash
cd client
npm install
```

### Configure environment variables

Backend (`server/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JINA_API_KEY=your_jina_api_key
```

Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### Run the application

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

## 📌 Future Improvements

- Email notifications
- Advanced AI ranking
- Admin dashboard
- Location-based item search

---

⭐ If you found this project useful, consider giving it a star!
