from fastapi.testclient import TestClient
from backend.main import app
from backend.database import Base, engine

# Create the tables just in case
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_api_flow():
    # 1. Test Signup (First user should be admin)
    response = client.post("/api/auth/signup", json={
        "name": "Test Admin",
        "email": "admin@example.com",
        "password": "password123"
    })
    assert response.status_code == 200, f"Signup failed: {response.text}"
    data = response.json()
    assert data["role"] == "admin"
    
    # 2. Test Login
    response = client.post("/api/auth/login", data={
        "username": "admin@example.com",
        "password": "password123"
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Test Create Project
    response = client.post("/api/projects/", json={
        "name": "Test Project",
        "description": "A project for testing"
    }, headers=headers)
    assert response.status_code == 200, f"Create project failed: {response.text}"
    project_id = response.json()["id"]
    
    # 4. Test Create Task
    response = client.post("/api/tasks/", json={
        "title": "Test Task",
        "project_id": project_id,
        "priority": "high"
    }, headers=headers)
    assert response.status_code == 200, f"Create task failed: {response.text}"
    task_id = response.json()["id"]
    
    # 5. Test Change Task Status
    response = client.patch(f"/api/tasks/{task_id}/status", json={
        "status": "in_progress"
    }, headers=headers)
    assert response.status_code == 200, f"Update status failed: {response.text}"
    
    # 6. Test Dashboard Stats
    response = client.get("/api/dashboard/stats", headers=headers)
    assert response.status_code == 200, f"Dashboard stats failed: {response.text}"
    stats = response.json()
    assert stats["total_tasks"] == 1
    assert stats["in_progress_tasks"] == 1
    
    # 7. Test Activity Log
    response = client.get(f"/api/projects/{project_id}/activity", headers=headers)
    assert response.status_code == 200, f"Activity log failed: {response.text}"
    activities = response.json()
    assert len(activities) >= 2 # Project created, Task created, Task status updated
    
    print("All backend API tests passed successfully!")

if __name__ == "__main__":
    test_api_flow()
