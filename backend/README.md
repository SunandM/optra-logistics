# Route Optimization Backend API

A FastAPI-based delivery route optimization system inspired by MaxOptra.

## Setup Instructions

### 1. Activate Virtual Environment
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Initialize Database
```bash
python models.py
```

### 4. Run the API Server
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

## Database Models

### Drivers
- Driver information and availability status
- Relationships with vehicles and routes

### Vehicles  
- Vehicle details and capacity information
- Assignment to drivers

### Orders
- Customer orders with pickup/delivery locations
- Time windows and priority levels
- Package specifications

### Routes
- Optimized route stops and sequences
- ETA tracking and status updates

## Next Steps
- Add route optimization endpoints
- Implement Google OR-Tools integration
- Add authentication and authorization
- Create API endpoints for CRUD operations
