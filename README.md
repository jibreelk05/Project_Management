# 🚀 Enterprise-Grade Full-Stack Project Management Platform

[![Frontend Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://project-management-1s83.vercel.app)
[![Backend API](https://img.shields.io/badge/Render-Live_API-blue?style=for-the-badge&logo=render)](https://project-management-o03u.onrender.com/api/v1)
[![API Docs](https://img.shields.io/badge/Swagger-OpenAPI_3.0-brightgreen?style=for-the-badge&logo=swagger)](https://project-management-o03u.onrender.com/api-docs)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

A full-stack, production-ready **Project Management Application** built using modern web architecture, robust RESTful APIs, strict CORS security enforcement, and a fully decoupled deployment pipeline.

---

## 🔗 Live Application & API

* **Live Frontend Web App:** [https://project-management-1s83.vercel.app](https://project-management-1s83.vercel.app)
* **Backend API Base URL:** [https://project-management-o03u.onrender.com/api/v1](https://project-management-o03u.onrender.com/api/v1)
* **Interactive API Documentation (Swagger):** [https://project-management-o03u.onrender.com/api-docs](https://project-management-o03u.onrender.com/api-docs)

---

## 🛠️ Key Architectural & Engineering Highlights

This platform was built adhering to industry best practices, scalability standards, and strict web security protocols:

### 🔒 Enterprise Security & Access Control
* **Strict CORS Whitelisting:** Implemented a dynamic origin-matching middleware restricting cross-origin resource sharing solely to verified client domains (`CLIENT_URL` / Vercel deployment and local development origins).
* **HTTP Hardening:** Integrated **Helmet.js** to automatically attach protective HTTP response headers (preventing XSS, Clickjacking, and MIME sniffing attacks).
* **Stateless Authentication:** Built-in JWT (JSON Web Token) authentication flow with role-based access control and protected route authorization.

### 🏗️ Backend Design & Reliability
* **Modular Layered Architecture:** Clear separation of concerns with isolated Routing (`routes/`), Controller Logic, Data Schemas (`models/`), Middlewares, and Centralized Error Handling (`utils/AppError.js`).
* **Global Error Middleware:** Production-level centralized error pipeline catching unhandled rejections, Mongoose validation errors, duplicate keys, and invalid ObjectIDs seamlessly without application crashes.
* **API Versioning:** Clean API design structure under `/api/v1/` ensuring backward compatibility and long-term maintainability.
* **Interactive API Documentation:** Embedded **OpenAPI 3.0 / Swagger UI** integration for automated, interactive endpoint testing and developer onboarding.

### ⚡ Decoupled Deployment Pipeline
* **Separation of Concerns:** Independent deployment architecture hosting the Client Single Page Application (SPA) on **Vercel** and the Node.js API Service on **Render**.
* **Strict Environment Isolation:** Secure runtime injection of dynamic API configurations (`VITE_API_URL` and `CLIENT_URL`) avoiding hardcoded secrets across development and production environments.

---

## 🧰 Tech Stack & Ecosystem

| Layer | Technologies / Libraries |
| :--- | :--- |
| **Frontend** | React, Vite, JavaScript (ES6+), Axios |
| **Backend** | Node.js, Express.js (ES Modules), Express Router |
| **Database** | MongoDB, Mongoose ODM |
| **Security** | JSON Web Tokens (JWT), Helmet.js, CORS (Origin Whitelist Pattern) |
| **Documentation** | Swagger UI Express, OpenAPI 3.0 Specification |
| **Deployment & Infrastructure** | Vercel (Frontend SPA), Render (Containerized Node.js Service) |

---

## 📡 Core API Modules & Endpoints

| Module | Route Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| **Auth** | `/api/v1/auth/register` | `POST` | Register new user account | ❌ |
| **Auth** | `/api/v1/auth/login` | `POST` | Authenticate credentials & return JWT | ❌ |
| **Projects** | `/api/v1/projects` | `GET` / `POST` | Fetch project list / Create new project | ✅ |
| **Projects** | `/api/v1/projects/:id` | `GET` / `PUT` / `DELETE` | Retrieve, update, or archive project | ✅ |
| **Tasks** | `/api/v1/tasks` | `GET` / `POST` | Query tasks / Assign new task | ✅ |
| **Users** | `/api/v1/users` | `GET` / `PATCH` | Manage user profiles and permissions | ✅ |

> 💡 *For interactive testing and schema inspection, explore the live [Swagger Documentation](https://project-management-o03u.onrender.com/api-docs).*

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **MongoDB** instance (Local or MongoDB Atlas Cluster)

### 1. Clone Repository
```bash
git clone https://github.com/jibreelk05/project-management.git
cd project-management
```

### 2. Backend Configuration
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```
Run the development backend server:
```bash
npm run dev
```

### 3. Frontend Configuration
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```
Start the frontend development server:
```bash
npm run dev
```

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).