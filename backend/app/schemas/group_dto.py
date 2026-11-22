from pydantic import BaseModel

class GroupCreateDTO(BaseModel):
    name: str
    description: str | None = None