from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError
from models import get_db, User
from auth_utils import verify_token

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current authenticated user from JWT token"""
    try:
        payload = verify_token(credentials.credentials)
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )
    
    return user

def require_role(required_role: str):
    """Decorator to require specific user role"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. {required_role} role required.",
            )
        return current_user
    return role_checker

def require_min_role(min_role: str):
    """Decorator to require minimum user role (user < driver < dispatcher < admin < superadmin)"""
    role_hierarchy = {"user": 0, "driver": 1, "dispatcher": 2, "admin": 3, "superadmin": 4}
    
    def role_checker(current_user: User = Depends(get_current_user)):
        user_role_level = role_hierarchy.get(current_user.role, 0)
        required_role_level = role_hierarchy.get(min_role, 0)
        
        if user_role_level < required_role_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. {min_role} role or higher required.",
            )
        return current_user
    return role_checker

def require_admin_or_higher(current_user: User = Depends(get_current_user)):
    """Require admin or superadmin role"""
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin role required.",
        )
    return current_user

def require_dispatcher_or_higher(current_user: User = Depends(get_current_user)):
    """Require dispatcher, admin, or superadmin role"""
    if current_user.role not in ["dispatcher", "admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Dispatcher role required.",
        )
    return current_user

def require_dispatcher_or_higher_no_users(current_user: User = Depends(get_current_user)):
    """Require dispatcher, admin, or superadmin role - but no access to /users/ endpoints for dispatcher"""
    if current_user.role not in ["dispatcher", "admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Dispatcher role required.",
        )
    return current_user

def require_driver_or_higher(current_user: User = Depends(get_current_user)):
    """Require driver, dispatcher, admin, or superadmin role (for mobile app endpoints)"""
    if current_user.role not in ["driver", "dispatcher", "admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Driver role required.",
        )
    return current_user

def require_superadmin(current_user: User = Depends(get_current_user)):
    """Require superadmin role"""
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Superadmin role required.",
        )
    return current_user
