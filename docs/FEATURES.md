# 🚀 Feature Flags Documentation

## Overview

TravelConnect uses environment-based feature flags to enable/disable functionality. This allows for:
- Gradual feature rollouts
- A/B testing
- Quick feature disabling in production
- Environment-specific configurations

## Available Feature Flags

### FEATURE_CAB_SHARING
**Default:** `true`

Enables the cab sharing functionality.

**When Enabled:**
- Users can create cab share offers
- Users can join existing cab shares
- Cab share section visible in UI
- Related API endpoints active

**When Disabled:**
- Cab sharing routes return 404
- UI hides cab sharing sections
- Database operations still available (for data preservation)

---

### FEATURE_FLIGHT_TRACKING
**Default:** `true`

Enables flight tracking and status updates.

**When Enabled:**
- Flight number validation
- Real-time flight status (future: API integration)
- Flight delay notifications

**When Disabled:**
- Flight numbers stored but not validated
- No status tracking

---

### FEATURE_NETWORKING
**Default:** `true`

Enables professional networking features.

**When Enabled:**
- Connection requests
- Professional profile sections
- Network feed
- Professional matching

**When Disabled:**
- Basic profiles only
- No connection functionality

---

### FEATURE_CHAT
**Default:** `true`

Enables real-time messaging.

**When Enabled:**
- Direct messaging between connections
- Group chat for cab shares
- Message notifications

**When Disabled:**
- No chat functionality
- Contact info shared via profiles

---

### FEATURE_NOTIFICATIONS
**Default:** `true`

Enables push and in-app notifications.

**When Enabled:**
- Travel match notifications
- Connection request alerts
- Cab share updates
- System announcements

**When Disabled:**
- No notifications sent
- Users must manually check updates

---

### FEATURE_AI_MATCHING
**Default:** `false`

Enables AI-powered traveler matching.

**When Enabled:**
- Smart travel suggestions
- Professional compatibility scoring
- Route optimization
- Predictive networking

**When Disabled:**
- Basic matching by route/date only

---

## Usage

### Backend (Python/FastAPI)

```python
from app.core.config import settings

# Check single feature
if settings.FEATURE_CAB_SHARING:
    router.include_router(cab_shares.router)

# Guard endpoint
@router.get("/cab-shares")
async def list_cab_shares():
    if not settings.FEATURE_CAB_SHARING:
        raise HTTPException(404, "Feature not available")
    # ... implementation
```

### Frontend (TypeScript/Next.js)

```typescript
// In component
const cabSharingEnabled = process.env.NEXT_PUBLIC_FEATURE_CAB_SHARING === 'true';

// Conditional render
{cabSharingEnabled && <CabShareSection />}

// In config
export const features = {
  cabSharing: process.env.NEXT_PUBLIC_FEATURE_CAB_SHARING === 'true',
  networking: process.env.NEXT_PUBLIC_FEATURE_NETWORKING === 'true',
  // ...
};
```

## Adding New Feature Flags

1. **Add to env.example:**
   ```
   FEATURE_NEW_FEATURE=false
   ```

2. **Add to backend config:**
   ```python
   # app/core/config.py
   class Settings(BaseSettings):
       FEATURE_NEW_FEATURE: bool = False
   ```

3. **Add frontend env (if needed):**
   ```
   NEXT_PUBLIC_FEATURE_NEW_FEATURE=false
   ```

4. **Document in this file**

5. **Implement conditional logic**

## Best Practices

1. **Default to disabled** for new/experimental features
2. **Default to enabled** for core functionality
3. **Always provide fallback UI** when features are disabled
4. **Log feature flag status** at application startup
5. **Document dependencies** between flags
6. **Test both states** in CI/CD






