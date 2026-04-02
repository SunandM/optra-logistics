from sqlalchemy.orm import Session
from models import Driver, Vehicle, Order, Route
from typing import List, Optional
from datetime import datetime

# Driver CRUD
def get_driver(db: Session, driver_id: int):
    return db.query(Driver).filter(Driver.id == driver_id).first()

def get_drivers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Driver).offset(skip).limit(limit).all()

def create_driver(db: Session, driver: dict):
    db_driver = Driver(**driver)
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

# Vehicle CRUD
def get_vehicle(db: Session, vehicle_id: int):
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

def get_vehicles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Vehicle).offset(skip).limit(limit).all()

def create_vehicle(db: Session, vehicle: dict):
    db_vehicle = Vehicle(**vehicle)
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

# Order CRUD
def get_order(db: Session, order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Order).offset(skip).limit(limit).all()

def create_order(db: Session, order: dict):
    db_order = Order(**order)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_pending_orders(db: Session):
    return db.query(Order).filter(Order.status == "pending").all()

# Route CRUD
def get_routes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Route).offset(skip).limit(limit).all()

def create_route(db: Session, route: dict):
    db_route = Route(**route)
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route
