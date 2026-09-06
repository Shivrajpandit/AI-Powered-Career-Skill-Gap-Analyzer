from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_register_user_success(client: TestClient):
    """Test registering a new user."""
    payload = {
        "email": "testuser@example.com",
        "password": "SecurePassword123!",
        "full_name": "Test User",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data
    assert "hashed_password" not in data


def test_register_user_duplicate_email(client: TestClient):
    """Test that registering duplicate emails returns a 400 error."""
    payload = {
        "email": "duplicate@example.com",
        "password": "SecurePassword123!",
        "full_name": "Duplicate User",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_login_success(client: TestClient):
    """Test successful login returns a valid JWT bearer token."""
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "loginuser@example.com",
            "password": "Password123!",
            "full_name": "Login User",
        },
    )

    # Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "loginuser@example.com",
            "password": "Password123!",
        },
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"


def test_login_invalid_credentials(client: TestClient):
    """Test login with incorrect password fails."""
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpwd@example.com",
            "password": "Password123!",
            "full_name": "Wrong Password User",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpwd@example.com",
            "password": "WrongPassword!",
        },
    )
    assert login_res.status_code == 401


def test_get_current_user_profile(client: TestClient):
    """Test protected /me endpoint with valid and invalid JWT."""
    # 1. Register & Login
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "profileuser@example.com",
            "password": "Password123!",
            "full_name": "Profile User",
        },
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "profileuser@example.com",
            "password": "Password123!",
        },
    )
    token = login_res.json()["access_token"]

    # 2. Access /me with token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    profile = me_res.json()
    assert profile["email"] == "profileuser@example.com"
    assert profile["full_name"] == "Profile User"

    # 3. Access /me without token fails
    unauth_res = client.get("/api/v1/auth/me")
    assert unauth_res.status_code == 401
