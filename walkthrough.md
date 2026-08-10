# Spendly — Profile Photo Removal Bug Fix

## Summary of Fixes

1. **Schema & Nullable Handling** ([shared/src/index.ts](file:///c:/Users/Taheer/Desktop/Spendly/shared/src/index.ts)):
   - Updated `UpdateProfileSchema` so `avatarUrl` accepts `z.string().nullable().optional()`.

2. **Explicit Null Transmission & State Update** ([ProfileView.tsx](file:///c:/Users/Taheer/Desktop/Spendly/client/src/modules/profile/ProfileView.tsx)):
   - Updated form payload generation so when `form.avatarUrl` is cleared (`""`), `payload.avatarUrl` is set to `null` instead of `undefined`.
   - `PATCH /user/profile` receives `{ avatarUrl: null }` and updates Supabase PostgreSQL to clear `avatarUrl` to `null`.
   - Updated state sync (`avatarUrl: data.user.avatarUrl ?? null`) so the local state and global auth store reflect `null` immediately.
   - User initials render immediately, and the photo remains cleared across page refreshes.

---

## Monorepo Build Results
```text
✓ spendly-shared: tsc PASSED (0 errors)
✓ spendly-server: tsc PASSED (0 errors)
✓ spendly-client: vite build PASSED (1905 modules transformed in 14.77s)
```
