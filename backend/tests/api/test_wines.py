"""Tests for Wine endpoints"""

import pytest
from httpx import AsyncClient
from decimal import Decimal

from app.models.inventory import Wine, Supplier


@pytest.mark.asyncio
async def test_create_wine_success(admin_client: AsyncClient, test_db):
    """Test creating wine with valid data as admin"""
    # First create a supplier
    supplier_response = await admin_client.post(
        "/api/v1/inventory/suppliers",
        json={"name": "Cantina Test"}
    )
    assert supplier_response.status_code == 200
    supplier_id = supplier_response.json()["id"]
    
    # Create wine
    wine_data = {
        "name": "Barolo DOCG",
        "vintage": 2018,
        "type": "red",
        "denomination": "DOCG",
        "price": 45.50,
        "quantity": 10,
        "threshold": 5,
        "barcode": "8001234567890",
        "supplier_id": supplier_id,
        "notes": "Riserva speciale"
    }
    
    response = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Barolo DOCG"
    assert data["vintage"] == 2018
    assert data["denomination"] == "DOCG"
    assert float(data["price"]) == 45.50
    assert data["quantity"] == 10
    assert data["threshold"] == 5
    assert data["barcode"] == "8001234567890"
    assert data["supplier_id"] == supplier_id
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_create_wine_minimal(admin_client: AsyncClient):
    """Test creating wine with minimal required fields"""
    wine_data = {
        "name": "Simple Wine",
        "vintage": 2020,
        "price": 12.00
    }
    
    response = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Simple Wine"
    assert data["quantity"] == 0  # default
    assert data["threshold"] == 10  # default
    assert data["type"] == "other"  # default


@pytest.mark.asyncio
async def test_create_wine_duplicate_barcode(admin_client: AsyncClient):
    """Test creating wine with duplicate barcode fails"""
    wine_data = {
        "name": "Wine 1",
        "vintage": 2020,
        "price": 10.00,
        "barcode": "DUPLICATE123"
    }
    
    # Create first wine
    response1 = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    assert response1.status_code == 200
    
    # Try to create second wine with same barcode
    wine_data["name"] = "Wine 2"
    response2 = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    assert response2.status_code == 400
    assert "barcode" in response2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_create_wine_invalid_supplier(admin_client: AsyncClient):
    """Test creating wine with non-existent supplier fails"""
    wine_data = {
        "name": "Wine",
        "vintage": 2020,
        "price": 10.00,
        "supplier_id": 99999  # Non-existent
    }
    
    response = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    assert response.status_code == 404
    assert "supplier" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_create_wine_as_magazziniere(magazziniere_client: AsyncClient):
    """Test magazziniere can create wines"""
    wine_data = {
        "name": "Wine by Magazziniere",
        "vintage": 2021,
        "price": 15.00
    }
    
    response = await magazziniere_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_create_wine_as_consultatore_forbidden(consultatore_client: AsyncClient):
    """Test consultatore cannot create wines"""
    wine_data = {
        "name": "Forbidden Wine",
        "vintage": 2021,
        "price": 15.00
    }
    
    response = await consultatore_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_wines_empty(consultatore_client: AsyncClient):
    """Test listing wines when database is empty"""
    response = await consultatore_client.get("/api/v1/inventory/wines")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
async def test_list_wines_with_data(consultatore_client: AsyncClient, admin_client: AsyncClient):
    """Test listing wines returns created wines"""
    # Create some wines
    for i in range(3):
        await admin_client.post(
            "/api/v1/inventory/wines",
            json={
                "name": f"Wine {i+1}",
                "vintage": 2020 + i,
                "price": 10.00 + i
            }
        )
    
    response = await consultatore_client.get("/api/v1/inventory/wines")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["name"] == "Wine 1"
    assert data[1]["name"] == "Wine 2"
    assert data[2]["name"] == "Wine 3"


@pytest.mark.asyncio
async def test_list_wines_pagination(consultatore_client: AsyncClient, admin_client: AsyncClient):
    """Test wine list pagination"""
    # Create 5 wines
    for i in range(5):
        await admin_client.post(
            "/api/v1/inventory/wines",
            json={
                "name": f"Wine {i+1}",
                "vintage": 2020,
                "price": 10.00
            }
        )
    
    # Get first page (limit 2)
    response = await consultatore_client.get("/api/v1/inventory/wines?skip=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # Get second page
    response = await consultatore_client.get("/api/v1/inventory/wines?skip=2&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_list_wines_search(consultatore_client: AsyncClient, admin_client: AsyncClient):
    """Test wine list search filter"""
    # Create wines with different names
    await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Barolo DOCG", "vintage": 2018, "price": 45.00}
    )
    await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Chianti Classico", "vintage": 2020, "price": 15.00}
    )
    await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Barbaresco", "vintage": 2019, "price": 40.00}
    )
    
    # Search for "Barolo"
    response = await consultatore_client.get("/api/v1/inventory/wines?search=Barolo")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Barolo DOCG"
    
    # Search for "Bar" (should match Barolo and Barbaresco)
    response = await consultatore_client.get("/api/v1/inventory/wines?search=Bar")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_get_wine_by_id(consultatore_client: AsyncClient, admin_client: AsyncClient):
    """Test getting wine by ID"""
    # Create wine
    create_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Test Wine",
            "vintage": 2020,
            "price": 20.00,
            "notes": "Test notes"
        }
    )
    wine_id = create_response.json()["id"]
    
    # Get wine by ID
    response = await consultatore_client.get(f"/api/v1/inventory/wines/{wine_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == wine_id
    assert data["name"] == "Test Wine"
    assert data["notes"] == "Test notes"


@pytest.mark.asyncio
async def test_get_wine_not_found(consultatore_client: AsyncClient):
    """Test getting non-existent wine returns 404"""
    response = await consultatore_client.get("/api/v1/inventory/wines/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_wine_by_barcode(consultatore_client: AsyncClient, admin_client: AsyncClient):
    """Test barcode lookup"""
    # Create wine with barcode
    await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Barcode Wine",
            "vintage": 2020,
            "price": 25.00,
            "barcode": "TESTBARCODE123"
        }
    )
    
    # Lookup by barcode
    response = await consultatore_client.get("/api/v1/inventory/barcode/TESTBARCODE123")
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Barcode Wine"
    assert data["barcode"] == "TESTBARCODE123"


@pytest.mark.asyncio
async def test_get_wine_by_barcode_not_found(consultatore_client: AsyncClient):
    """Test barcode lookup for non-existent barcode"""
    response = await consultatore_client.get("/api/v1/inventory/barcode/NOTEXIST")
    assert response.status_code == 404
