# Session Management Integration - TODO

## Backend Integration ✅
- [x] Fixed sessionRoutes.ts import to point to correct controller path
- [x] Added session routes to server/index.ts
- [x] Session controller and routes are properly linked

## Frontend API Integration ✅
- [x] Added session-related types to types.ts
- [x] Added sessionApi to endpoints.ts with all CRUD operations
- [x] Created useSession hook for React Native frontend
- [x] Exported useSession from hooks/index.ts

## Next Steps
- [ ] Create teacher screens to use the session management (SessionList, SessionCreate, SessionDetails)
- [ ] Integrate session management with attendance tracking
- [ ] Add auto-start session checking in the app
- [ ] Test the full integration end-to-end

## Files Modified
- server/routes/sessionRoutes.ts - Fixed import path
- server/index.ts - Added session routes
- tracker/src/core/api/types.ts - Added session types
- tracker/src/core/api/endpoints.ts - Added sessionApi
- tracker/src/hooks/useSession.ts - Created session hook
- tracker/src/hooks/index.ts - Exported useSession

## API Endpoints Available
- POST /api/sessions - Create session
- GET /api/sessions - Get sessions with filtering
- GET /api/sessions/:id - Get session by ID
- PUT /api/sessions/:id - Update session
- DELETE /api/sessions/:id - Delete session
- POST /api/sessions/:id/start - Start session
- POST /api/sessions/:id/end - End session
- GET /api/sessions/auto-start - Check auto-start sessions
