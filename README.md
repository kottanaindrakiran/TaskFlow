<div align="center">
  
# TaskFlow 🚀

**A Full-Stack Team Task Manager Web App**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

TaskFlow is a production-ready project and task management platform featuring a sleek dark-themed UI, role-based access control, interactive Kanban boards, and comprehensive activity tracking.

</div>

---
<img width="1837" height="927" alt="image" src="https://github.com/user-attachments/assets/ac8c444d-26b2-4d82-ae07-296c902a50c9" />
<img width="1831" height="956" alt="image" src="https://github.com/user-attachments/assets/6348d6bf-eed1-4f05-bab9-8c322374f8f3" />
<img width="1894" height="961" alt="image" src="https://github.com/user-attachments/assets/ac2b13ff-8af4-48d3-b5a1-affd25527484" />
<img width="1883" height="885" alt="image" src="https://github.com/user-attachments/assets/d7f7a951-2b54-443c-8734-c2c206e0e613" />





## ✨ Features

- **🔐 JWT Authentication:** Secure Signup & Login with bcrypt password hashing.
- **🛡️ Role-Based Access Control (RBAC):** Distinct permissions for Admin and Member roles.
- **📁 Project & Team Management:** Easily create projects and assign/remove team members.
- **✅ Task Tracking:** Comprehensive task creation, assignment, priority, and deadline management.
- **📋 Interactive Kanban Board:** Native Drag and Drop functionality (Todo → In Progress → Done).
- **📊 Real-Time Dashboard:** Overview statistics (Total, Completed, In Progress, Overdue tasks).
- **📝 Activity Log:** Auto-logged history per project on task creation, assignments, and status updates.
- **🔔 Toast Notifications:** Elegant real-time success and error alerts.
- **📖 API Documentation:** Automatic OpenAPI documentation via FastAPI Swagger UI at `/docs`.

---

## 🛠️ Tech Stack

| Frontend 🎨 | Backend ⚙️ | Database & Deployment 🚀 |
| :--- | :--- | :--- |
| **React (Vite)** | **FastAPI (Python)** | **PostgreSQL** |
| **Tailwind CSS** | **SQLAlchemy ORM** | **Railway** (Backend Hosting) |
| **React Router** | **Passlib / Jose** | **Vercel** (Frontend Hosting) |
| **React Hot Toast** | **Pydantic** | **Git / GitHub** |

---

## 👥 Role Permissions

| Action | Admin 👑 | Member 👤 |
| :--- | :---: | :---: |
| View Assigned Projects & Tasks | ✅ | ✅ |
| Change Task Status (Kanban) | ✅ | ✅ |
| Create / Update Tasks | ✅ | ✅ |
| Create / Delete Projects | ✅ | ❌ |
| Add / Remove Team Members | ✅ | ❌ |
| Change User Roles | ✅ | ❌ |

---

## 🔌 API Endpoints

### Authentication & Users
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new user | Public |
| `POST` | `/auth/login` | Authenticate and retrieve JWT token | Public |
| `GET` | `/users/me` | Get current logged-in user profile | Auth |
| `GET` | `/users/` | List all users on the platform | Admin |
| `PATCH` | `/users/{id}/role` | Change a user's role (Admin ↔ Member) | Admin |

### Projects
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/projects/` | List accessible projects | Auth |
| `POST` | `/projects/` | Create a new project | Admin |
| `PUT` | `/projects/{id}` | Update project details | Admin |
| `DELETE` | `/projects/{id}` | Delete a project and its tasks | Admin |
| `POST` | `/projects/{id}/members` | Add a member to a project | Admin |
| `DELETE` | `/projects/{id}/members/{user_id}` | Remove a member | Admin |
| `GET` | `/projects/{id}/activity` | Get project activity log | Project Member |

### Tasks & Dashboard
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks/` | List tasks (supports filtering) | Project Member |
| `GET` | `/tasks/{id}` | Get specific task details | Project Member |
| `POST` | `/tasks/` | Create a new task | Project Member |
| `PUT` | `/tasks/{id}` | Update task details | Project Member |
| `PATCH` | `/tasks/{id}/status` | Update task status (Kanban drop) | Project Member |
| `DELETE` | `/tasks/{id}` | Delete a task | Admin |
| `GET` | `/dashboard/stats` | Retrieve aggregate metrics | Auth |

---

## 💻 Local Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/kottanaindrakiran/TaskFlow.git
cd TaskFlow
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file based on .env.example
# SECRET_KEY=your-secret-key
# DATABASE_URL=your-postgresql-url
# FRONTEND_URL=your-vercel-url

# Start the FastAPI server
uvicorn main:app --reload
```
*The backend API will be available at `http://localhost:8000` and Swagger docs at `http://localhost:8000/docs`.*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Configure Environment Variables
# Create a .env file based on .env.example
# VITE_API_URL=your-railway-backend-url

# Start the Vite development server
npm run dev
```
*The frontend application will be available at `http://localhost:5173`.*

---

## 🚀 Deployment

The repository is structured to support seamless CI/CD to modern PaaS providers.

- **Backend (Railway):** Deployment is managed via the included `Procfile` and `railway.json`. Simply connect your GitHub repository to Railway, set the environment variables (`DATABASE_URL`, `SECRET_KEY`), and Railway will automatically build and serve the FastAPI app.
- **Frontend (Vercel):** Deployment uses Vite configuration out of the box. Connect the repository to Vercel, set the root directory to `frontend/`, configure the `VITE_API_URL` environment variable, and Vercel will handle the static builds and React Router routing overrides via `vercel.json`.

---

## 📁 Project Structure

```text
TaskFlow/
├── backend/
│   ├── main.py                # FastAPI initialization & CORS middleware
│   ├── database.py            # SQLAlchemy setup
│   ├── models.py              # DB schema (Users, Projects, Tasks, Logs)
│   ├── schemas.py             # Pydantic models for request/response validation
│   ├── auth.py                # JWT & bcrypt logic
│   ├── dependencies.py        # Dependency injection for DB and Auth
│   ├── routers/               # API endpoint grouped by features
│   ├── requirements.txt       # Python dependencies
│   ├── Procfile               # Railway deployment configuration
│   └── railway.json           # Railway configuration
└── frontend/
    ├── src/
    │   ├── api/               # Axios instance & JWT interceptor
    │   ├── components/        # Reusable UI components (Sidebar)
    │   ├── context/           # AuthContext (React Context API)
    │   ├── pages/             # Application views (Login, Dashboard, Projects, Tasks, Team)
    │   ├── App.jsx            # Router and ProtectedRoute configurations
    │   └── index.css          # Tailwind CSS global styles
    ├── index.html
    ├── package.json
    ├── tailwind.config.js     # Dark theme definitions
    └── vercel.json            # Vercel deployment configuration
```

---

<p align="center">
  <i>Built for Ethara AI Assessment</i>
</p>
