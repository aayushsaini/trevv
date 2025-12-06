"""
User Service

Business logic for user operations.
"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class UserService:
    """Service class for user operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()
    
    def create(self, user_data: UserCreate) -> User:
        """Create a new user."""
        hashed_password = get_password_hash(user_data.password)
        
        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            name=user_data.name,
            profession=user_data.profession,
            company=user_data.company,
            bio=user_data.bio,
            location=user_data.location,
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def update(self, user: User, user_data: UserUpdate) -> User:
        """Update user profile."""
        update_data = user_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password."""
        user = self.get_by_email(email)
        
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    def search(
        self,
        query: Optional[str] = None,
        profession: Optional[str] = None,
        limit: int = 20
    ) -> List[User]:
        """Search users by name, profession, or company."""
        db_query = self.db.query(User).filter(User.is_active == True)
        
        if query:
            search_term = f"%{query}%"
            db_query = db_query.filter(
                (User.name.ilike(search_term)) |
                (User.profession.ilike(search_term)) |
                (User.company.ilike(search_term))
            )
        
        if profession:
            db_query = db_query.filter(User.profession.ilike(f"%{profession}%"))
        
        return db_query.limit(limit).all()






