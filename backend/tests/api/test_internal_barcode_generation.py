"""
Integration tests for internal barcode generation endpoint.

Tests the POST /wines/{wine_id}/barcode/generate endpoint.
"""

import pytest
from httpx import AsyncClient

from app.api.deps import get_current_session
from app.main import app


# Mock session dependency
def override_get_current_session_admin():
    return {"user_id": 1, "role": "admin", "email": "admin@example.com"}


@pytest.fixture
async def admin_client(client):
    app.dependency_overrides[get_current_session] = override_get_current_session_admin
    yield client
    app.dependency_overrides.pop(get_current_session, None)


@pytest.mark.asyncio
async def test_generate_internal_barcode_success(admin_client, test_db):
    """Test successful internal barcode generation"""
    # Create a wine without barcode
    wine_data = {
        "name": "Test Wine for Internal Barcode",
        "vintage": 2020,
        "type": "red",
        "price": 15.00,
        "quantity": 10
    }
    
    create_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    assert create_response.status_code == 200
    wine_id = create_response.json()["id"]
    
    # Generate internal barcode
    generate_response = await admin_client.post(
        f"/api/v1/inventory/wines/{wine_id}/barcode/generate"
    )
    
    assert generate_response.status_code == 200
    updated_wine = generate_response.json()
    
    # Verify barcode was generated correctly
    expected_barcode = f"INT{wine_id:010d}"
    assert updated_wine["barcode"] == expected_barcode
    assert updated_wine["barcode_type"] == "INTERNAL"
    
    # Verify we can search by the generated barcode
    search_response = await admin_client.get(
        f"/api/v1/inventory/wines/barcode/{expected_barcode}"
    )
    assert search_response.status_code == 200
    assert search_response.json()["id"] == wine_id


@pytest.mark.asyncio
async def test_generate_internal_barcode_wine_not_found(admin_client, test_db):
    """Test internal barcode generation for non-existent wine"""
    # Try to generate barcode for non-existent wine
    generate_response = await admin_client.post(
        "/api/v1/inventory/wines/999999/barcode/generate"
    )
    
    assert generate_response.status_code == 404
    assert "Wine not found" in generate_response.json()["detail"]


@pytest.mark.asyncio
async def test_generate_internal_barcode_replaces_existing(admin_client, test_db):
    """Test that generating internal barcode replaces existing barcode"""
    # Create a wine with an external barcode
    wine_data = {
        "name": "Test Wine with External Barcode",
        "vintage": 2020,
        "type": "red",
        "price": 15.00,
        "quantity": 10,
        "barcode": "1234567890123",
        "barcode_type": "EAN13"
    }
    
    create_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    assert create_response.status_code == 200
    wine_id = create_response.json()["id"]
    
    # Generate internal barcode (should replace external)
    generate_response = await admin_client.post(
        f"/api/v1/inventory/wines/{wine_id}/barcode/generate"
    )
    
    assert generate_response.status_code == 200
    updated_wine = generate_response.json()
    
    # Verify internal barcode replaced external
    expected_barcode = f"INT{wine_id:010d}"
    assert updated_wine["barcode"] == expected_barcode
    assert updated_wine["barcode_type"] == "INTERNAL"
    
    # Verify old barcode no longer works
    old_search_response = await admin_client.get(
        "/api/v1/inventory/wines/barcode/1234567890123"
    )
    assert old_search_response.status_code == 404
    
    # Verify new barcode works
    new_search_response = await admin_client.get(
        f"/api/v1/inventory/wines/barcode/{expected_barcode}"
    )
    assert new_search_response.status_code == 200
    assert new_search_response.json()["id"] == wine_id


@pytest.mark.asyncio
async def test_internal_barcode_format(admin_client, test_db):
    """Test that generated internal barcodes follow correct format"""
    # Create multiple wines and generate internal barcodes
    wine_ids = []
    
    for i in range(3):
        wine_data = {
            "name": f"Test Wine {i}",
            "vintage": 2020,
            "type": "red",
            "price": 15.00,
            "quantity": 10
        }
        
        create_response = await admin_client.post(
            "/api/v1/inventory/wines",
            json=wine_data
        )
        assert create_response.status_code == 200
        wine_id = create_response.json()["id"]
        wine_ids.append(wine_id)
        
        # Generate internal barcode
        generate_response = await admin_client.post(
            f"/api/v1/inventory/wines/{wine_id}/barcode/generate"
        )
        assert generate_response.status_code == 200
        
        barcode = generate_response.json()["barcode"]
        
        # Verify format: INT + 10 digits (total 13 characters)
        assert len(barcode) == 13
        assert barcode.startswith("INT")
        assert barcode[3:].isdigit()
        
        # Verify it matches expected format
        expected = f"INT{wine_id:010d}"
        assert barcode == expected
