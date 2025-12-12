"""
Property-based tests for barcode scanning functionality.

These tests use Hypothesis to verify correctness properties across many inputs.
"""

import pytest
from hypothesis import given, strategies as st, settings, HealthCheck
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import Wine
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


# Strategy for generating valid barcodes (alphanumeric with some special chars)
barcode_strategy = st.text(
    alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'), min_codepoint=48, max_codepoint=122),
    min_size=1,
    max_size=20
).filter(lambda x: x.strip() != "")  # Exclude empty or whitespace-only strings


@pytest.mark.asyncio
@given(barcode=barcode_strategy)
@settings(
    max_examples=100, 
    deadline=None,
    suppress_health_check=[HealthCheck.function_scoped_fixture]
)
async def test_barcode_search_consistency_property(barcode, admin_client, test_db):
    """
    **Feature: barcode-scanning, Property 2: Barcode Search Consistency**
    **Validates: Requirements 2.1, 2.2**
    
    Property: For any valid barcode, searching for it should return the same wine every time (idempotent).
    
    This test verifies that:
    1. If a wine with a barcode exists, searching returns that wine consistently
    2. Multiple searches for the same barcode return identical results
    3. The search operation is idempotent
    """
    # Create a wine with the generated barcode
    wine_data = {
        "name": f"Test Wine {barcode[:10]}",
        "vintage": 2020,
        "type": "red",
        "price": 15.50,
        "quantity": 10,
        "barcode": barcode
    }
    
    # Create wine
    create_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    
    # Skip if barcode already exists (uniqueness constraint)
    if create_response.status_code == 400:
        return
    
    assert create_response.status_code == 200
    created_wine = create_response.json()
    wine_id = created_wine["id"]
    
    # Search for the wine by barcode multiple times
    search_results = []
    for _ in range(3):
        response = await admin_client.get(f"/api/v1/inventory/wines/barcode/{barcode}")
        assert response.status_code == 200, f"Search failed for barcode {barcode}"
        search_results.append(response.json())
    
    # Verify all searches return the same wine (idempotent)
    for result in search_results:
        assert result["id"] == wine_id, "Search returned different wine ID"
        assert result["barcode"] == barcode, "Search returned different barcode"
        assert result["name"] == wine_data["name"], "Search returned different wine name"
        assert result["vintage"] == wine_data["vintage"], "Search returned different vintage"
    
    # Verify all results are identical
    assert all(r == search_results[0] for r in search_results), \
        "Multiple searches for same barcode returned different results"


@pytest.mark.asyncio
@given(
    initial_stock=st.integers(min_value=0, max_value=1000),
    quantity_to_add=st.integers(min_value=1, max_value=100)
)
@settings(
    max_examples=100,
    deadline=None,
    suppress_health_check=[HealthCheck.function_scoped_fixture]
)
async def test_movement_stock_update_correctness_in_property(initial_stock, quantity_to_add, admin_client, test_db):
    """
    **Feature: barcode-scanning, Property 3: Movement Stock Update Correctness**
    **Validates: Requirements 3.4**
    
    Property: For any wine and movement, after creating a movement of type "in" with quantity Q,
    the wine's stock should increase by exactly Q bottles.
    
    This test verifies that:
    1. Stock increases by the exact quantity specified
    2. The operation is deterministic and correct for all valid inputs
    3. No stock is lost or gained unexpectedly
    """
    # Generate unique barcode for this test
    barcode = f"TEST{initial_stock}{quantity_to_add}"
    
    # Create wine with initial stock
    wine_data = {
        "name": f"Test Wine {barcode}",
        "vintage": 2020,
        "type": "red",
        "price": 15.00,
        "quantity": initial_stock,
        "barcode": barcode
    }
    
    create_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    
    # Skip if barcode already exists
    if create_response.status_code == 400:
        return
    
    assert create_response.status_code == 200
    wine_id = create_response.json()["id"]
    
    # Create movement by barcode (carico/in)
    movement_response = await admin_client.post(
        "/api/v1/inventory/movements/barcode",
        json={
            "barcode": barcode,
            "type": "in",
            "quantity": quantity_to_add,
            "unit": "BOTTLE"
        }
    )
    
    assert movement_response.status_code == 200
    
    # Verify stock increased by exact quantity
    wine_response = await admin_client.get(f"/api/v1/inventory/wines/{wine_id}")
    assert wine_response.status_code == 200
    
    updated_wine = wine_response.json()
    expected_quantity = initial_stock + quantity_to_add
    
    assert updated_wine["quantity"] == expected_quantity, \
        f"Stock should be {expected_quantity} (initial {initial_stock} + added {quantity_to_add}), but got {updated_wine['quantity']}"


@pytest.mark.asyncio
@given(
    initial_stock=st.integers(min_value=10, max_value=1000),
    quantity_to_remove=st.integers(min_value=1, max_value=10)
)
@settings(
    max_examples=100,
    deadline=None,
    suppress_health_check=[HealthCheck.function_scoped_fixture]
)
async def test_movement_stock_update_correctness_out_property(initial_stock, quantity_to_remove, admin_client, test_db):
    """
    **Feature: barcode-scanning, Property 4: Movement Stock Update Correctness (Out)**
    **Validates: Requirements 3.5**
    
    Property: For any wine and movement, after creating a movement of type "out" with quantity Q,
    the wine's stock should decrease by exactly Q bottles.
    
    This test verifies that:
    1. Stock decreases by the exact quantity specified
    2. The operation is deterministic and correct for all valid inputs
    3. No stock is lost or gained unexpectedly
    """
    # Generate unique barcode for this test
    barcode = f"TESTOUT{initial_stock}{quantity_to_remove}"
    
    # Create wine with initial stock (set to 0 first)
    wine_data = {
        "name": f"Test Wine Out {barcode}",
        "vintage": 2020,
        "type": "red",
        "price": 15.00,
        "quantity": 0,
        "barcode": barcode
    }
    
    create_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    
    # Skip if barcode already exists
    if create_response.status_code == 400:
        return
    
    assert create_response.status_code == 200
    wine_id = create_response.json()["id"]
    
    # First add stock using movement endpoint to create lots
    add_response = await admin_client.post(
        "/api/v1/inventory/movements/barcode",
        json={
            "barcode": barcode,
            "type": "in",
            "quantity": initial_stock,
            "unit": "BOTTLE"
        }
    )
    assert add_response.status_code == 200
    
    # Now remove stock (scarico/out)
    movement_response = await admin_client.post(
        "/api/v1/inventory/movements/barcode",
        json={
            "barcode": barcode,
            "type": "out",
            "quantity": quantity_to_remove,
            "unit": "BOTTLE"
        }
    )
    
    assert movement_response.status_code == 200
    
    # Verify stock decreased by exact quantity
    wine_response = await admin_client.get(f"/api/v1/inventory/wines/{wine_id}")
    assert wine_response.status_code == 200
    
    updated_wine = wine_response.json()
    expected_quantity = initial_stock - quantity_to_remove
    
    assert updated_wine["quantity"] == expected_quantity, \
        f"Stock should be {expected_quantity} (initial {initial_stock} - removed {quantity_to_remove}), but got {updated_wine['quantity']}"


@pytest.mark.asyncio
@given(
    initial_stock=st.integers(min_value=1, max_value=100),
    movements=st.lists(
        st.tuples(
            st.sampled_from(["in", "out"]),  # movement type
            st.integers(min_value=1, max_value=20)  # quantity
        ),
        min_size=1,
        max_size=10
    )
)
@settings(
    max_examples=100,
    deadline=None,
    suppress_health_check=[HealthCheck.function_scoped_fixture]
)
async def test_stock_non_negative_invariant_property(initial_stock, movements, admin_client, test_db):
    """
    **Feature: barcode-scanning, Property 5: Stock Non-Negative Invariant**
    **Validates: Requirements 3.6**
    
    Property: For any wine, after any sequence of movements, the stock quantity must never be negative.
    
    This test verifies that:
    1. Stock never goes below zero regardless of movement sequence
    2. System rejects movements that would result in negative stock
    3. The invariant holds across all valid movement sequences
    """
    # Generate unique barcode for this test
    import hashlib
    barcode_hash = hashlib.md5(str(movements).encode()).hexdigest()[:10]
    barcode = f"TESTINV{barcode_hash}"
    
    # Create wine with initial stock (set to 0 first)
    wine_data = {
        "name": f"Test Wine Inv {barcode}",
        "vintage": 2020,
        "type": "red",
        "price": 15.00,
        "quantity": 0,
        "barcode": barcode
    }
    
    create_response = await admin_client.post(
        "/api/v1/inventory/wines",
        json=wine_data
    )
    
    # Skip if barcode already exists
    if create_response.status_code == 400:
        return
    
    assert create_response.status_code == 200
    wine_id = create_response.json()["id"]
    
    # Add initial stock
    add_response = await admin_client.post(
        "/api/v1/inventory/movements/barcode",
        json={
            "barcode": barcode,
            "type": "in",
            "quantity": initial_stock,
            "unit": "BOTTLE"
        }
    )
    assert add_response.status_code == 200
    
    # Track expected stock
    expected_stock = initial_stock
    
    # Apply sequence of movements
    for movement_type, quantity in movements:
        movement_response = await admin_client.post(
            "/api/v1/inventory/movements/barcode",
            json={
                "barcode": barcode,
                "type": movement_type,
                "quantity": quantity,
                "unit": "BOTTLE"
            }
        )
        
        if movement_type == "in":
            # IN movements should always succeed
            assert movement_response.status_code == 200
            expected_stock += quantity
        elif movement_type == "out":
            if quantity <= expected_stock:
                # OUT movement should succeed if stock is sufficient
                assert movement_response.status_code == 200
                expected_stock -= quantity
            else:
                # OUT movement should fail if stock is insufficient
                assert movement_response.status_code == 400
                assert "Insufficient stock" in movement_response.json()["detail"]
                # Stock should remain unchanged
        
        # Verify stock is never negative
        wine_response = await admin_client.get(f"/api/v1/inventory/wines/{wine_id}")
        assert wine_response.status_code == 200
        current_stock = wine_response.json()["quantity"]
        
        assert current_stock >= 0, \
            f"Stock became negative: {current_stock}. This violates the non-negative invariant!"
        
        assert current_stock == expected_stock, \
            f"Stock mismatch: expected {expected_stock}, got {current_stock}"


@pytest.mark.asyncio
@given(
    num_wines=st.integers(min_value=2, max_value=5)
)
@settings(
    max_examples=100,
    deadline=None,
    suppress_health_check=[HealthCheck.function_scoped_fixture]
)
async def test_barcode_uniqueness_property(num_wines, admin_client, test_db):
    """
    **Feature: barcode-scanning, Property 1: Barcode Uniqueness**
    **Validates: Requirements 1.3**
    
    Property: For any two wines in the database, if both have barcodes assigned, 
    their barcodes must be different.
    
    This test verifies that:
    1. Each barcode can only be assigned to one wine
    2. Attempting to assign a duplicate barcode is rejected
    3. The uniqueness constraint is enforced across all wines
    """
    import time
    import random
    
    # Generate unique barcodes using timestamp and random numbers (max 20 chars)
    timestamp = int(time.time() * 1000) % 1000000  # Last 6 digits of milliseconds
    barcodes = [f"U{timestamp}{random.randint(100, 999)}{i}" for i in range(num_wines)]
    
    wine_ids = []
    
    # Create wines with unique barcodes
    for i, barcode in enumerate(barcodes):
        wine_data = {
            "name": f"Test Wine Uniq {timestamp} {i}",
            "vintage": 2020 + (i % 5),  # Keep vintage in reasonable range
            "type": "red",
            "price": 15.00 + i,
            "quantity": 10
        }
        
        # Create wine without barcode first
        create_response = await admin_client.post(
            "/api/v1/inventory/wines",
            json=wine_data
        )
        
        assert create_response.status_code == 200
        wine_id = create_response.json()["id"]
        wine_ids.append(wine_id)
        
        # Assign barcode to wine
        assign_response = await admin_client.post(
            f"/api/v1/inventory/wines/{wine_id}/barcode",
            json={
                "barcode": barcode,
                "barcode_type": "EAN13"
            }
        )
        
        assert assign_response.status_code == 200, \
            f"Failed to assign barcode {barcode}: {assign_response.json()}"
        assigned_wine = assign_response.json()
        assert assigned_wine["barcode"] == barcode
    
    # Verify all wines have different barcodes
    all_wines = []
    for wine_id in wine_ids:
        wine_response = await admin_client.get(f"/api/v1/inventory/wines/{wine_id}")
        assert wine_response.status_code == 200
        all_wines.append(wine_response.json())
    
    # Extract all barcodes
    assigned_barcodes = [wine["barcode"] for wine in all_wines]
    
    # Verify all barcodes are unique (no duplicates)
    assert len(assigned_barcodes) == len(set(assigned_barcodes)), \
        f"Duplicate barcodes found: {assigned_barcodes}"
    
    # Verify each barcode matches what we assigned
    for i, barcode in enumerate(barcodes):
        assert barcode in assigned_barcodes, \
            f"Barcode {barcode} not found in assigned barcodes"
    
    # Try to assign a duplicate barcode to a different wine (should fail)
    if len(wine_ids) >= 2:
        duplicate_barcode = barcodes[0]
        target_wine_id = wine_ids[1]
        
        # Try to reassign the first barcode to the second wine
        duplicate_response = await admin_client.post(
            f"/api/v1/inventory/wines/{target_wine_id}/barcode",
            json={
                "barcode": duplicate_barcode,
                "barcode_type": "EAN13"
            }
        )
        
        # Should fail with 409 Conflict
        assert duplicate_response.status_code == 409, \
            f"Expected 409 Conflict when assigning duplicate barcode, got {duplicate_response.status_code}"
        assert "already assigned" in duplicate_response.json()["detail"].lower()
