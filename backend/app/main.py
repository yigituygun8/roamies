from fastapi import FastAPI

from .routers.group_router import router as group_router
from .routers.user_router import router as user_router

app = FastAPI(title="Roamies API")

@app.get("/")
def root():
    return {"message": "Roamies API is running \n localhost:8000/docs"}

app.include_router(group_router)
app.include_router(user_router)
