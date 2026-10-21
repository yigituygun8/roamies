from ..models.user import User

class UserService:
    def create_user(self, username: str, email: str) -> User:
        return User(username=username, email=email)