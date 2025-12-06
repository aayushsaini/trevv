"""
Connection Service

Business logic for networking/connection operations.
"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.connection import Connection, ConnectionStatus
from app.schemas.connection import ConnectionCreate


class ConnectionService:
    """Service class for connection operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, connection_id: UUID) -> Optional[Connection]:
        """Get connection by ID."""
        return self.db.query(Connection).filter(Connection.id == connection_id).first()
    
    def get_user_connections(
        self,
        user_id: UUID,
        status: Optional[ConnectionStatus] = None
    ) -> List[Connection]:
        """Get all connections for a user (both directions)."""
        query = self.db.query(Connection).filter(
            or_(
                Connection.requester_id == user_id,
                Connection.addressee_id == user_id
            )
        )
        
        if status:
            query = query.filter(Connection.status == status)
        
        return query.order_by(Connection.created_at.desc()).all()
    
    def get_pending_requests(self, user_id: UUID) -> List[Connection]:
        """Get pending connection requests for a user."""
        return self.db.query(Connection).filter(
            Connection.addressee_id == user_id,
            Connection.status == ConnectionStatus.PENDING
        ).order_by(Connection.created_at.desc()).all()
    
    def check_existing_connection(
        self,
        user_id_1: UUID,
        user_id_2: UUID
    ) -> Optional[Connection]:
        """Check if a connection already exists between two users."""
        return self.db.query(Connection).filter(
            or_(
                and_(
                    Connection.requester_id == user_id_1,
                    Connection.addressee_id == user_id_2
                ),
                and_(
                    Connection.requester_id == user_id_2,
                    Connection.addressee_id == user_id_1
                )
            )
        ).first()
    
    def create(self, requester_id: UUID, connection_data: ConnectionCreate) -> Connection:
        """Create a new connection request."""
        connection = Connection(
            requester_id=requester_id,
            addressee_id=connection_data.addressee_id,
            message=connection_data.message,
            context=connection_data.context,
            travel_plan_id=connection_data.travel_plan_id,
        )
        
        self.db.add(connection)
        self.db.commit()
        self.db.refresh(connection)
        
        return connection
    
    def update_status(
        self,
        connection: Connection,
        status: ConnectionStatus
    ) -> Connection:
        """Update connection status (accept/reject)."""
        connection.status = status
        self.db.commit()
        self.db.refresh(connection)
        
        return connection
    
    def get_connection_count(self, user_id: UUID) -> int:
        """Get count of accepted connections for a user."""
        return self.db.query(Connection).filter(
            or_(
                Connection.requester_id == user_id,
                Connection.addressee_id == user_id
            ),
            Connection.status == ConnectionStatus.ACCEPTED
        ).count()






