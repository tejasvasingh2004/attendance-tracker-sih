from fastapi import FastAPI # type: ignore

# Create app
app = FastAPI()

# Root route
@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI server!"}

# Example API route
@app.get("/api/data")
def get_data():
    return {"message": "This is data from FastAPI backend"}

# Example route with parameter
@app.get("/api/user/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id, "status": "active"}
