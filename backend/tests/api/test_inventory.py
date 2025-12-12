import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import Wine, Supplier
from app.api.deps import get_current_session
from app.main import app

# Mock session dependency to simulate logged-in user
def override_get_current_session_admin():
    return {"user_id": 1, "role": "admin", "email": "admin@example.com"}

def override_get_current_session_magazziniere():
    return {"user_id": 2, "role": "magazziniere", "email": "maga@example.com"}

def override_get_current_session_consultatore():
    return {"user_id": 3, "role": "consultatore", "email": "user@example.com"}

@pytest.fixture
async def admin_client(client):
    print(f"DEBUG: app type is {type(app)}")
    print(f"DEBUG: app is {app}")
    app.dependency_overrides[get_current_session] = override_get_current_session_admin
    yield client
    app.dependency_overrides.pop(get_current_session, None)

@pytest.fixture
async def magazziniere_client(client):
    app.dependency_overrides[get_current_session] = override_get_current_session_magazziniere
    yield client
    app.dependency_overrides.pop(get_current_session, None)

@pytest.fixture
async def consultatore_client(client):
    app.dependency_overrides[get_current_session] = override_get_current_session_consultatore
    yield client
    app.dependency_overrides.pop(get_current_session, None)

# ---------- Tests ----------

@pytest.mark.asyncio
async def test_create_supplier(admin_client):
    response = await admin_client.post(
        "/api/v1/inventory/suppliers",
        json={"name": "Cantina Sociale", "contact_email": "info@cantina.it"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Cantina Sociale"
    assert "id" in data

@pytest.mark.asyncio
async def test_create_wine(admin_client):
    # First create a supplier
    sup_res = await admin_client.post(
        "/api/v1/inventory/suppliers",
        json={"name": "Cantina Test"}
    )
    supplier_id = sup_res.json()["id"]

    response = await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Barolo 2018",
            "vintage": 2018,
            "type": "red",
            "price": 45.50,
            "quantity": 10,
            "barcode": "123456789",
            "supplier_id": supplier_id
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Barolo 2018"
    assert data["quantity"] == 10

@pytest.mark.asyncio
async def test_list_wines(consultatore_client, admin_client):
    # Create wine as admin
    await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Chardonnay",
            "vintage": 2022,
            "type": "white",
            "price": 12.00,
            "quantity": 5
        }
    )
    
    # Read as consultatore
    response = await consultatore_client.get("/api/v1/inventory/wines")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Chardonnay"

@pytest.mark.asyncio
async def test_create_movement_in(magazziniere_client, admin_client):
    # Create wine
    w_res = await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Merlot",
            "vintage": 2020,
            "type": "red",
            "price": 10.0,
            "quantity": 0
        }
    )
    wine_id = w_res.json()["id"]

    # Add stock (IN)
    response = await magazziniere_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "in",
            "quantity": 12,
            "note": "Consegna settimanale"
        }
    )
    assert response.status_code == 200
    
    # Verify new quantity
    w_res_after = await magazziniere_client.get(f"/api/v1/inventory/wines/{wine_id}")
    assert w_res_after.json()["quantity"] == 12

@pytest.mark.asyncio
async def test_create_movement_out_insufficient_stock(magazziniere_client, admin_client):
    # Create wine with 5 bottles
    w_res = await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Pinot Nero",
            "vintage": 2021,
            "type": "red",
            "price": 20.0,
            "quantity": 5
        }
    )
    wine_id = w_res.json()["id"]

    # Try to remove 10
    response = await magazziniere_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "out",
            "quantity": 10
        }
    )
    assert response.status_code == 400
    # Error can be either "No lots available" or "Insufficient stock"
    assert "stock" in response.json()["detail"].lower() or "lot" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_barcode_lookup_success(consultatore_client, admin_client):
    """Test successful barcode lookup - Requirement 2.1, 2.2"""
    # Create wine with barcode
    await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Prosecco",
            "vintage": 2023,
            "type": "sparkling",
            "price": 8.50,
            "quantity": 100,
            "barcode": "8001234567890"
        }
    )
    
    # Search by barcode
    response = await consultatore_client.get("/api/v1/inventory/wines/barcode/8001234567890")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Prosecco"
    assert data["vintage"] == 2023
    assert data["type"] == "sparkling"
    assert data["quantity"] == 100
    assert data["barcode"] == "8001234567890"

@pytest.mark.asyncio
async def test_barcode_lookup_not_found(consultatore_client):
    """Test barcode not found returns 404 - Requirement 2.3"""
    response = await consultatore_client.get("/api/v1/inventory/wines/barcode/9999999999999")
    assert response.status_code == 404
    assert "Wine not found for barcode" in response.json()["detail"]

@pytest.mark.asyncio
async def test_barcode_lookup_empty_barcode(consultatore_client):
    """Test empty barcode returns 400 - Requirement 2.4"""
    # Test with empty string
    response = await consultatore_client.get("/api/v1/inventory/wines/barcode/ ")
    assert response.status_code == 400
    assert "Barcode is required" in response.json()["detail"]

@pytest.mark.asyncio
async def test_barcode_lookup_with_special_characters(consultatore_client, admin_client):
    """Test barcode with special characters (Code128 format)"""
    # Create wine with Code128 barcode
    await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Chianti Classico",
            "vintage": 2020,
            "type": "red",
            "price": 25.00,
            "quantity": 50,
            "barcode": "ABC-123.456",
            "barcode_type": "CODE128"
        }
    )
    
    # Search by barcode
    response = await consultatore_client.get("/api/v1/inventory/wines/barcode/ABC-123.456")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Chianti Classico"
    assert data["barcode"] == "ABC-123.456"

@pytest.mark.asyncio
async def test_permission_denied(consultatore_client):
    # Consultatore cannot create suppliers
    response = await consultatore_client.post(
        "/api/v1/inventory/suppliers",
        json={"name": "Hacker Wine"}
    )
    assert response.status_code == 403

# ---------- Movement by Barcode Tests ----------

@pytest.mark.asyncio
async def test_movement_by_barcode_carico_success(magazziniere_client, admin_client):
    """Test successful carico (in) movement by barcode - Requirement 3.1, 3.4"""
    # Create wine with barcode
    w_res = await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Barbera d'Alba",
            "vintage": 2021,
            "type": "red",
            "price": 15.00,
            "quantity": 10,
            "barcode": "8012345678901"
        }
    )
    wine_id = w_res.json()["id"]
    
    # Create movement by barcode (carico)
    response = await magazziniere_client.post(
        "/api/v1/inventory/movements/barcode",
        json={
            "barcode": "8012345678901",
            "type": "in",
            "quantity": 12,
            "unit": "BOTTLE",
            "note": "Nuovo arrivo"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["wine_name"] == "Barbera d'Alba"
    assert data["wine_vintage"] == 2021
    assert data["type"] == "in"
    assert data["quantity"] == 12
    
    # Verify wine quantity increased
    w_res_after = await magazziniere_client.get(f"/api/v1/inventory/wines/{wine_id}")
    assert w_res_after.json()["quantity"] == 22  # 10 + 12

@pytest.mark.asyncio
async def test_movement_by_barcode_scarico_success(magazziniere_client, admin_client):
    """Test successful scarico (out) movement by barcode - Requirement 3.1, 3.5"""
    # Create wine with barcode and stock
    w_res = await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Vermentino",
            "vintage": 2022,
            "type": "white",
            "price": 12.00,
            "quantity": 0,
            "barcode": "8012345678902"
        }
    )
    wine_id = w_res.json()["id"]
    
    # First add stock
    await magazziniere_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "in",
            "quantity": 24
        }
    )
    
    # Create movement by barcode (scarico)
    response = await magazziniere_client.post(
        "/api/v1/inventory/movements/barcode",
        json={
            "barcode": "8012345678902",
            "type": "out",
            "quantity": 6,
            "unit": "BOTTLE",
            "note": "Vendita"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["wine_name"] == "Vermentino"
    assert data["type"] == "out"
    assert data["quantity"] == 6
    
    # Verify wine quantity decreased
    w_res_after = await magazziniere_client.get(f"/api/v1/inventory/wines/{wine_id}")
    assert w_res_after.json()["quantity"] == 18  # 24 - 6

@pytest.mark.asyncio
async def test_movement_by_barcode_scarico_insufficient_stock(magazziniere_client, admin_client):
    """Test scarico with insufficient stock returns 400 - Requirement 3.6"""
    # Create wine with barcode and limited stock
    w_res = await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Brunello",
            "vintage": 2018,
            "type": "red",
            "price": 50.00,
            "quantity": 0,
            "barcode": "8012345678903"
        }
    )
    
    # Add only 5 bottles
    wine_id = w_res.json()["id"]
    await magazziniere_client.post(
        "/api/v1/inventory/movements",
        json={
            "wine_id": wine_id,
            "type": "in",
            "quantity": 5
        }
    )
    
    # Try to remove 10 bottles
    response = await magazziniere_client.post(
        "/api/v1/inventory/movements/barcode",
        json={
            "barcode": "8012345678903",
            "type": "out",
            "quantity": 10,
            "unit": "BOTTLE"
        }
    )
    assert response.status_code == 400
    assert "Insufficient stock" in response.json()["detail"]

@pytest.mark.asyncio
async def test_movement_by_barcode_wine_not_found(magazziniere_client):
    """Test movement with non-existent barcode returns 404 - Requirement 3.1"""
    response = await magazziniere_client.post(
        "/api/v1/inventory/movements/barcode",
        json={
            "barcode": "9999999999999",
            "type": "in",
            "quantity": 12,
            "unit": "BOTTLE"
        }
    )
    assert response.status_code == 404
    assert "Wine not found for barcode" in response.json()["detail"]

# ---------- Barcode Assignment Tests ----------

@pytest.mark.asyncio
async def test_assign_barcode_success(magazziniere_client, admin_client):
    """Test successful barcode assignment - Requirement 1.3"""
    # Create wine without barcode
    w_res = await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Amarone",
            "vintage": 2019,
            "type": "red",
            "price": 60.00,
            "quantity": 20
        }
    )
    wine_id = w_res.json()["id"]
    
    # Assign barcode
    response = await magazziniere_client.post(
        f"/api/v1/inventory/wines/{wine_id}/barcode",
        json={
            "barcode": "8012345678910",
            "barcode_type": "EAN13"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["barcode"] == "8012345678910"
    assert data["barcode_type"] == "EAN13"
    assert data["name"] == "Amarone"

@pytest.mark.asyncio
async def test_assign_barcode_duplicate(magazziniere_client, admin_client):
    """Test duplicate barcode returns 409 - Requirement 1.3"""
    # Create first wine with barcode
    await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Montepulciano",
            "vintage": 2020,
            "type": "red",
            "price": 18.00,
            "quantity": 30,
            "barcode": "8012345678920"
        }
    )
    
    # Create second wine without barcode
    w_res2 = await admin_client.post(
        "/api/v1/inventory/wines",
        json={
            "name": "Sangiovese",
            "vintage": 2021,
            "type": "red",
            "price": 16.00,
            "quantity": 25
        }
    )
    wine_id2 = w_res2.json()["id"]
    
    # Try to assign same barcode to second wine
    response = await magazziniere_client.post(
        f"/api/v1/inventory/wines/{wine_id2}/barcode",
        json={
            "barcode": "8012345678920",
            "barcode_type": "EAN13"
        }
    )
    assert response.status_code == 409
    assert "Barcode already assigned" in response.json()["detail"]

@pytest.mark.asyncio
async def test_assign_barcode_invalid_wine_id(magazziniere_client):
    """Test invalid wine_id returns 404 - Requirement 1.3"""
    response = await magazziniere_client.post(
        "/api/v1/inventory/wines/99999/barcode",
        json={
            "barcode": "8012345678930",
            "barcode_type": "EAN13"
        }
    )
    assert response.status_code == 404
    assert "Wine not found" in response.json()["detail"]
