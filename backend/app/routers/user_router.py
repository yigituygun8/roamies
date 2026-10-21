from fastapi import APIRouter
from ..schemas.user_dto import UserCreateDTO
from ..services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

user_service = UserService()

@router.post("/")
def create_user(data: UserCreateDTO):
    user = user_service.create_user(
        username=data.username,
        email=data.email
    )

    return {
        "username": user.username,
        "email": user.email
    }