from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import math
from typing import List, Tuple, Dict
from models import Order, Driver, Vehicle

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    """Calculate distance between two coordinates in meters using Haversine formula"""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 1000  # Default distance if coordinates are missing
    
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat/2)**2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    distance = R * c
    return int(distance)

def create_distance_matrix(orders: List[Order], depot_lat: float = 40.7128, depot_lng: float = -74.0060) -> List[List[int]]:
    """Create distance matrix for route optimization"""
    locations = [(depot_lat, depot_lng)]  # Start with depot
    
    # Add pickup and delivery locations for each order
    for order in orders:
        if order.pickup_lat and order.pickup_lng:
            locations.append((order.pickup_lat, order.pickup_lng))
        if order.delivery_lat and order.delivery_lng:
            locations.append((order.delivery_lat, order.delivery_lng))
    
    # Calculate distance matrix
    distance_matrix = []
    for i, (lat1, lon1) in enumerate(locations):
        row = []
        for j, (lat2, lon2) in enumerate(locations):
            if i == j:
                row.append(0)
            else:
                row.append(calculate_distance(lat1, lon1, lat2, lon2))
        distance_matrix.append(row)
    
    return distance_matrix

def optimize_routes(orders: List[Order], driver: Driver, vehicle: Vehicle) -> Dict:
    """
    Optimize routes for given orders using OR-Tools
    Returns optimized route information
    """
    if not orders:
        return {"success": False, "message": "No orders to optimize"}
    
    # Create distance matrix
    distance_matrix = create_distance_matrix(orders)
    
    # Create routing model
    manager = pywrapcp.RoutingIndexManager(len(distance_matrix), 1, 0)
    routing = pywrapcp.RoutingModel(manager)
    
    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]
    
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # Set first solution heuristic
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    
    # Solve the problem
    solution = routing.SolveWithParameters(search_parameters)
    
    if not solution:
        return {"success": False, "message": "No solution found"}
    
    # Extract solution
    route = []
    index = routing.Start(0)
    route_distance = 0
    
    while not routing.IsEnd(index):
        node_index = manager.IndexToNode(index)
        route.append(node_index)
        previous_index = index
        index = solution.Value(routing.NextVar(index))
        route_distance += routing.GetArcCostForVehicle(previous_index, index, 0)
    
    route.append(manager.IndexToNode(index))  # Add end node
    
    return {
        "success": True,
        "route": route,
        "distance": route_distance,
        "message": f"Route optimized with distance {route_distance} meters"
    }

def simple_route_optimization(orders: List[Order]) -> List[Order]:
    """
    Simple route optimization based on priority and proximity
    Fallback method when OR-Tools fails or for simple cases
    """
    if not orders:
        return []
    
    # Sort by priority first, then by creation time
    priority_order = {"urgent": 0, "high": 1, "normal": 2, "low": 3}
    
    sorted_orders = sorted(orders, key=lambda x: (
        priority_order.get(x.priority, 2),
        x.created_at
    ))
    
    return sorted_orders
