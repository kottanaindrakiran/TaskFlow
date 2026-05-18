from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from database import engine, Base
from routers import auth, users, projects, tasks, dashboard

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://task-flow-sigma-six.vercel.app",
        "https://frontend-gamma-six-80.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to TaskFlow API"}
