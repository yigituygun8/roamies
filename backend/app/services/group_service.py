from models.group import Group

class GroupService:
    def create_group(
            self, name: str, description: str | None = None
    ) -> Group:
        return Group(name=name, description=description)