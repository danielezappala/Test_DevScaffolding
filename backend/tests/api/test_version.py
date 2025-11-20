"""Tests for version endpoint"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_version_endpoint(client: AsyncClient):
    """
    Test that version endpoint returns correct structure.
    
    Args:
        client: Test client fixture
    """
    response = await client.get("/api/v1/version")
    
    assert response.status_code == 200
    
    data = response.json()
    assert "version" in data
    assert "commit" in data
    assert "build_date" in data
    
    # Verify types
    assert isinstance(data["version"], str)
    assert isinstance(data["commit"], str)
    assert isinstance(data["build_date"], str)


@pytest.mark.asyncio
async def test_version_endpoint_values(client: AsyncClient):
    """
    Test that version endpoint returns expected values.
    
    Args:
        client: Test client fixture
    """
    response = await client.get("/api/v1/version")
    data = response.json()
    
    # Version should not be empty
    assert len(data["version"]) > 0
    assert len(data["commit"]) > 0
    assert len(data["build_date"]) > 0
