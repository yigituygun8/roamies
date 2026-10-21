from fastapi import APIRouter
from ..schemas.group_dto import GroupCreateDTO
from ..services.group_service import GroupService

router = APIRouter(prefix="/groups", tags=["Groups"])

group_service = GroupService()


@router.post("/")
def create_group(data: GroupCreateDTO):
    group = group_service.create_group(
        name=data.name,
        description=data.description
    )

    return {
        "name": group.name,
        "description": group.description
    }