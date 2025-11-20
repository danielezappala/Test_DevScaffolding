"""Tests for Stock Movement endpoints with lot management"""

import pytest
from httpx import AsyncClient
from datetime import date, datetime


@pytest.mark.asyncio
async def test_create_movement_in_creates_lot(admin_client: AsyncClient):
    """Test that IN movement automatically creates a lot"""
    # Create wine
    wine_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Test Wine", "vintage": 2020, "price": 10.00}
    )
    wine_id = wine_response.json()["id"]
    
    # Create IN movement
    movement_data = {
        "wine_id": wine_id,
        "type": "in",
        "quantity": 24,
        "note": "New delivery",
        "reference": "ORD-001"
    }
    
    response = await admin_client.post(
        "/api/v1/inventory/movements",
        json=movement_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "in"
    assert data["quantity"] == 24
    assert data["reference"] == "ORD-001"
    assert "lot_id" in data
    assert data["lot_id"] is not None  # Lot created automatically
    
    # Verify wine quantity updated
    wine_response = await admin_client.get(f"/api/v1/inventory/wines/{wine_id}")
    assert wine_response.json()["quantity"] == 24


@pytest.mark.asyncio
async def test_create_movement_out_fifo(admin_client: AsyncClient):
    """Test that OUT movement uses FIFO (oldest lot first)"""
    # Create wine
    wine_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "FIFO Wine", "vintage": 2020, "price": 15.00}
    )
    wine_id = wine_response.json()["id"]
    
    # Create first lot (older)
    await admin_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "in",
            "quantity": 12,
            "note": "First delivery"
        }
    )
    
    # Create second lot (newer)
    await admin_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "in",
            "quantity": 12,
            "note": "Second delivery"
        }
    )
    
    # Wine should have 24 total
    wine_response = await admin_client.get(f"/api/v1/inventory/wines/{wine_id}")
    assert wine_response.json()["quantity"] == 24
    
    # Create OUT movement (should use oldest lot first)
    out_response = await admin_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "out",
            "quantity": 6
        }
    )
    
    assert out_response.status_code == 200
    out_data = out_response.json()
    assert out_data["type"] == "out"
    assert out_data["quantity"] == 6
    
    # Verify wine quantity decreased
    wine_response = await admin_client.get(f"/api/v1/inventory/wines/{wine_id}")
    assert wine_response.json()["quantity"] == 18


@pytest.mark.asyncio
async def test_create_movement_out_specific_lot(admin_client: AsyncClient):
    """Test OUT movement from specific lot"""
    # Create wine and lot
    wine_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Specific Lot Wine", "vintage": 2020, "price": 20.00}
    )
    wine_id = wine_response.json()["id"]
    
    # Create lot
    in_response = await admin_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "in",
            "quantity": 24
        }
    )
    lot_id = in_response.json()["lot_id"]
    
    # OUT from specific lot
    out_response = await admin_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "out",
            "quantity": 6,
            "lot_id": lot_id
        }
    )
    
    assert out_response.status_code == 200
    assert out_response.json()["lot_id"] == lot_id
    assert out_response.json()["quantity"] == 6


@pytest.mark.asyncio
async def test_create_movement_out_insufficient_lot_stock(admin_client: AsyncClient):
    """Test OUT movement fails if specific lot has insufficient stock"""
    # Create wine and lot with 10 items
    wine_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Limited Lot Wine", "vintage": 2020, "price": 25.00}
    )
    wine_id = wine_response.json()["id"]
    
    in_response = await admin_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "in",
            "quantity": 10
        }
    )
    lot_id = in_response.json()["lot_id"]
    
    # Try to OUT 15 from lot with only 10
    out_response = await admin_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "out",
            "quantity": 15,
            "lot_id": lot_id
        }
    )
    
    assert out_response.status_code == 400
    assert "insufficient" in out_response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_create_movement_adjust_admin_only(admin_client: AsyncClient):
    """Test ADJUST movement is allowed for admin"""
    # Create wine
    wine_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Adjust Wine", "vintage": 2020, "price": 30.00}
    )
    wine_id = wine_response.json()["id"]
    
    # Admin can ADJUST
    admin_response = await admin_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "adjust",
            "quantity": 5,
            "note": "Inventory correction"
        }
    )
    assert admin_response.status_code == 200
    assert admin_response.json()["type"] == "adjust"


@pytest.mark.asyncio
async def test_create_movement_adjust_magazziniere_forbidden(magazziniere_client: AsyncClient):
    """Test ADJUST movement is forbidden for magazziniere"""
    # Create wine as magazziniere (allowed)
    wine_response = await magazziniere_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Adjust Wine 2", "vintage": 2020, "price": 30.00}
    )
    wine_id = wine_response.json()["id"]
    
    # Magazziniere cannot ADJUST
    mag_response = await magazziniere_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "adjust",
            "quantity": 5
        }
    )
    assert mag_response.status_code == 403


@pytest.mark.asyncio
async def test_list_movements_with_filters(admin_client: AsyncClient):
    """Test listing movements with various filters"""
    # Create two wines
    wine1_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Wine 1", "vintage": 2020, "price": 10.00}
    )
    wine1_id = wine1_response.json()["id"]
    
    wine2_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Wine 2", "vintage": 2021, "price": 15.00}
    )
    wine2_id = wine2_response.json()["id"]
    
    # Create movements for wine 1
    await admin_client.post(
        "/api/v1/inventory/movements",
        json={"wine_id": wine1_id, "type": "in", "quantity": 12}
    )
    await admin_client.post(
        "/api/v1/inventory/movements",
        json={"wine_id": wine1_id, "type": "out", "quantity": 6}
    )
    
    # Create movement for wine 2
    await admin_client.post(
        "/api/v1/inventory/movements",
        json={"wine_id": wine2_id, "type": "in", "quantity": 24}
    )
    
    # Filter by wine_id
    response = await admin_client.get(f"/api/v1/inventory/movements?wine_id={wine1_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(m["wine_id"] == wine1_id for m in data)
    
    # Filter by type
    response = await admin_client.get("/api/v1/inventory/movements?type=in")
    assert response.status_code == 200
    data = response.json()
    assert all(m["type"] == "in" for m in data)


@pytest.mark.asyncio
async def test_movement_includes_wine_details(consultatore_client: AsyncClient, admin_client: AsyncClient):
    """Test that movement response includes wine name and vintage"""
    # Create wine
    wine_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json={"name": "Detailed Wine", "vintage": 2019, "price": 35.00}
    )
    wine_id = wine_response.json()["id"]
    
    # Create movement
    movement_response = await admin_client.post(
        "/api/v1/inventory/movements",
        json={"wine_id": wine_id, "type": "in", "quantity": 12}
    )
    
    assert movement_response.status_code == 200
    data = movement_response.json()
    assert "wine_name" in data
    assert "wine_vintage" in data
    assert data["wine_name"] == "Detailed Wine"
    assert data["wine_vintage"] == 2019
