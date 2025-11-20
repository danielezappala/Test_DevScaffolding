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
async def test_barcode_lookup(consultatore_client, admin_client):
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
    
    response = await consultatore_client.get("/api/v1/inventory/barcode/8001234567890")
    assert response.status_code == 200
    assert response.json()["name"] == "Prosecco"

@pytest.mark.asyncio
async def test_permission_denied(consultatore_client):
    # Consultatore cannot create suppliers
    response = await consultatore_client.post(
        "/api/v1/inventory/suppliers",
        json={"name": "Hacker Wine"}
    )
    assert response.status_code == 403
