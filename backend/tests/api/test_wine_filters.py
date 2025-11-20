"""Tests for advanced wine filters and critical stock endpoint"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_wines_filter_by_type(admin_client: AsyncClient):
    """Test filtering wines by type"""
    # Create wines of different types
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Red Wine", "vintage": 2020, "price": 20.00, "type": "red"})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "White Wine", "vintage": 2020, "price": 15.00, "type": "white"})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Sparkling Wine", "vintage": 2020, "price": 25.00, "type": "sparkling"})
    
    # Filter by red
    response = await admin_client.get("/api/v1/inventory/wines?type=red")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["type"] == "red"


@pytest.mark.asyncio
async def test_list_wines_filter_by_vintage(admin_client: AsyncClient):
    """Test filtering wines by vintage"""
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Wine 2018", "vintage": 2018, "price": 30.00})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Wine 2019", "vintage": 2019, "price": 25.00})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Wine 2020", "vintage": 2020, "price": 20.00})
    
    response = await admin_client.get("/api/v1/inventory/wines?vintage=2019")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["vintage"] == 2019


@pytest.mark.asyncio
async def test_list_wines_filter_by_denomination(admin_client: AsyncClient):
    """Test filtering wines by denomination"""
    await admin_client.post("/api/v1/inventory/wines", json={"name": "DOCG Wine", "vintage": 2020, "price": 40.00, "denomination": "DOCG"})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "DOC Wine", "vintage": 2020, "price": 30.00, "denomination": "DOC"})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "IGT Wine", "vintage": 2020, "price": 20.00, "denomination": "IGT"})
    
    response = await admin_client.get("/api/v1/inventory/wines?denomination=DOCG")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["denomination"] == "DOCG"


@pytest.mark.asyncio
async def test_list_wines_filter_by_supplier(admin_client: AsyncClient):
    """Test filtering wines by supplier"""
    # Create suppliers
    supplier1 = await admin_client.post("/api/v1/inventory/suppliers", json={"name": "Supplier 1"})
    supplier2 = await admin_client.post("/api/v1/inventory/suppliers", json={"name": "Supplier 2"})
    s1_id = supplier1.json()["id"]
    s2_id = supplier2.json()["id"]
    
    # Create wines
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Wine S1", "vintage": 2020, "price": 20.00, "supplier_id": s1_id})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Wine S2", "vintage": 2020, "price": 20.00, "supplier_id": s2_id})
    
    response = await admin_client.get(f"/api/v1/inventory/wines?supplier_id={s1_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["supplier_id"] == s1_id


@pytest.mark.asyncio
async def test_list_wines_filter_available_only(admin_client: AsyncClient):
    """Test filtering wines with available_only flag"""
    # Create wines with different quantities
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Available Wine", "vintage": 2020, "price": 20.00, "quantity": 10})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Out of Stock", "vintage": 2020, "price": 20.00, "quantity": 0})
    
    response = await admin_client.get("/api/v1/inventory/wines?available_only=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["quantity"] > 0


@pytest.mark.asyncio
async def test_list_wines_filter_below_threshold(admin_client: AsyncClient):
    """Test filtering wines below threshold"""
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Low Stock", "vintage": 2020, "price": 20.00, "quantity": 3, "threshold": 10})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Good Stock", "vintage": 2020, "price": 20.00, "quantity": 15, "threshold": 10})
    
    response = await admin_client.get("/api/v1/inventory/wines?below_threshold=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["quantity"] < data[0]["threshold"]


@pytest.mark.asyncio
async def test_get_critical_stock(admin_client: AsyncClient):
    """Test critical stock endpoint"""
    # Create wines with different stock levels
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Critical", "vintage": 2020, "price": 20.00, "quantity": 0, "threshold": 10})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Warning", "vintage": 2020, "price": 20.00, "quantity": 5, "threshold": 10})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "OK", "vintage": 2020, "price": 20.00, "quantity": 15, "threshold": 10})
    
    response = await admin_client.get("/api/v1/inventory/critical")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Critical and Warning
    
    # Check severity levels
    critical_items = [item for item in data if item["severity"] == "critical"]
    warning_items = [item for item in data if item["severity"] == "warning"]
    assert len(critical_items) == 1
    assert len(warning_items) == 1


@pytest.mark.asyncio
async def test_get_critical_stock_filter_by_severity(admin_client: AsyncClient):
    """Test filtering critical stock by severity"""
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Critical", "vintage": 2020, "price": 20.00, "quantity": 0, "threshold": 10})
    await admin_client.post("/api/v1/inventory/wines", json={"name": "Warning", "vintage": 2020, "price": 20.00, "quantity": 5, "threshold": 10})
    
    # Filter only critical
    response = await admin_client.get("/api/v1/inventory/critical?severity=critical")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["severity"] == "critical"
    assert data[0]["quantity"] == 0
