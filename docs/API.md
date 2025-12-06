# 📚 API Documentation

## Base URL

- Development: `http://localhost:8000/api/v1`
- Production: `https://api.travelconnect.app/api/v1`

## Authentication

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "profession": "Software Engineer",
  "company": "TechCorp"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "access_token": "jwt_token"
  }
}
```

#### POST /auth/login
Authenticate user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "jwt_token",
    "token_type": "bearer"
  }
}
```

---

### Users

#### GET /users/me
Get current user profile.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://...",
    "profession": "Software Engineer",
    "company": "TechCorp",
    "bio": "Passionate traveler and tech enthusiast"
  }
}
```

#### PUT /users/me
Update current user profile.

#### GET /users/{id}
Get user by ID.

#### GET /users/search
Search users by name, profession, or company.

**Query Parameters:**
- `q`: Search query
- `profession`: Filter by profession
- `limit`: Results limit (default: 20)

---

### Travel Plans

#### GET /travels
Get all travel plans (with filters).

**Query Parameters:**
- `origin`: Filter by origin city
- `destination`: Filter by destination city
- `date`: Filter by travel date
- `type`: Filter by travel type (flight, train, bus, car)

#### POST /travels
Create a new travel plan.

**Request:**
```json
{
  "origin": "BLR",
  "destination": "DEL",
  "travel_date": "2024-03-15T10:30:00Z",
  "travel_type": "flight",
  "flight_number": "6E 2341",
  "notes": "Looking for cab share from Koramangala"
}
```

#### GET /travels/{id}
Get travel plan details.

#### PUT /travels/{id}
Update travel plan.

#### DELETE /travels/{id}
Delete travel plan.

---

### Connections

#### GET /connections
Get all connections for current user.

**Query Parameters:**
- `status`: Filter by status (pending, accepted, rejected)

#### POST /connections/request
Send connection request.

**Request:**
```json
{
  "addressee_id": "user_uuid",
  "message": "Would love to connect!"
}
```

#### PUT /connections/{id}/accept
Accept connection request.

#### PUT /connections/{id}/reject
Reject connection request.

---

### Cab Shares

#### GET /cab-shares
Get available cab shares.

**Query Parameters:**
- `travel_plan_id`: Filter by travel plan
- `origin`: Filter by pickup area
- `destination`: Filter by dropoff area
- `date`: Filter by date

#### POST /cab-shares
Create cab share offer.

**Request:**
```json
{
  "travel_plan_id": "uuid",
  "pickup_location": "Koramangala, Bangalore",
  "dropoff_location": "Kempegowda International Airport",
  "available_seats": 3,
  "price_per_seat": 250.00,
  "pickup_time": "2024-03-15T07:00:00Z"
}
```

#### POST /cab-shares/{id}/join
Join a cab share.

**Request:**
```json
{
  "seats_needed": 1,
  "pickup_point": "Near Forum Mall"
}
```

---

### Feed

#### GET /feed
Get personalized travel feed.

**Query Parameters:**
- `limit`: Number of items (default: 20)
- `offset`: Pagination offset

#### GET /feed/nearby
Get travelers with similar routes.

**Query Parameters:**
- `origin`: Your origin city
- `destination`: Your destination city
- `date`: Travel date
- `radius`: Matching radius in hours (default: 24)

---

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |






