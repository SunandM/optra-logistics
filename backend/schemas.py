from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "user"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class PasswordReset(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    delivery_method: str = "email"

class OTPVerify(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    otp_code: str

class PasswordResetConfirm(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    otp_code: str
    new_password: str

# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile

class LogoutResponse(BaseModel):
    message: str

# OTP schemas
class OTPBase(BaseModel):
    otp_code: str
    delivery_method: str
    expires_at: datetime
    is_used: bool = False

class OTP(OTPBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# User Request schemas
class UserRequestBase(BaseModel):
    request_type: str  # cancel_order, assign_order, assign_route
    order_id: Optional[int] = None
    message: Optional[str] = None

class UserRequestCreate(UserRequestBase):
    pass

class UserRequestUpdate(BaseModel):
    status: str  # pending, approved, rejected

class UserRequest(UserRequestBase):
    id: int
    user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Active Session schemas
class ActiveSessionBase(BaseModel):
    login_at: datetime
    logout_at: Optional[datetime] = None
    ip_address: Optional[str] = None
    is_active: bool = True

class ActiveSession(ActiveSessionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class ActiveSessionWithUser(ActiveSessionBase):
    id: int
    user_id: int
    user_name: str
    user_email: EmailStr
    user_role: str

    class Config:
        from_attributes = True

# Driver schemas
class DriverBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    license_number: Optional[str] = None
    is_active: bool = True

class DriverCreate(DriverBase):
    pass

class Driver(DriverBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Vehicle schemas
class VehicleBase(BaseModel):
    license_plate: str
    make: str
    model: str
    year: Optional[int] = None
    capacity: Optional[float] = None
    fuel_type: Optional[str] = None
    is_available: bool = True
    driver_id: Optional[int] = None

class VehicleCreate(VehicleBase):
    pass

class Vehicle(VehicleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Order schemas
class OrderBase(BaseModel):
    order_number: str
    customer_name: str
    customer_email: Optional[EmailStr] = None
    customer_phone: Optional[str] = None
    pickup_address: str
    delivery_address: str
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    package_weight: Optional[float] = None
    package_volume: Optional[float] = None
    priority: str = "normal"
    status: str = "pending"
    time_window_start: Optional[datetime] = None
    time_window_end: Optional[datetime] = None
    estimated_duration: Optional[int] = None

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Route schemas
class RouteBase(BaseModel):
    route_name: str
    driver_id: int
    vehicle_id: int
    order_id: int
    sequence_number: int
    stop_type: str
    estimated_arrival: Optional[datetime] = None
    estimated_departure: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    actual_departure: Optional[datetime] = None
    distance_from_previous: Optional[float] = None
    travel_time_from_previous: Optional[int] = None
    status: str = "planned"
    notes: Optional[str] = None

class RouteCreate(RouteBase):
    pass

class Route(RouteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Optimization schemas
class OptimizationRequest(BaseModel):
    driver_id: int
    vehicle_id: int
    order_ids: List[int]

class OptimizationResponse(BaseModel):
    success: bool
    message: str
    optimized_routes: Optional[List[Route]] = None
