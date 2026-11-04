# Security Specification - Ama Baby Care

## Data Invariants
1.  **User Identity**: A user can only read, write, or delete their own synchronization document (`/users/{userId}`).
2.  **Monitor Signaling**: Signaling documents (`/monitors/{villageToken}`) are only accessible to authenticated users who know the secret village token.
3.  **ICE Integrity**: Candidates can only be added to an existing monitor session and must identify if they are from the 'viewer' or 'camera'.
4.  **Temporal Integrity**: `updatedAt` and `timestamp` fields must be validated against the server time or reasonably close.
5.  **Schema Enforcement**: All writes must contain exactly the required fields and no "ghost" fields.

## The "Dirty Dozen" Payloads

1.  **Identity Spoof**: User A attempts to write to `/users/UserB`.
2.  **Unauthenticated Write**: Unauthenticated user attempts to create a monitor session.
3.  **Ghost Field Injection**: Adding `isAdmin: true` to a user document.
4.  **ID Poisoning**: Creating a monitor with a 1MB string as `villageToken`.
5.  **Orphaned Candidate**: Adding an ICE candidate to a non-existent monitor session.
6.  **Role Spoofing**: A viewer sends an ICE candidate with `from: 'camera'`.
7.  **Future Timestamp**: Writing a document with `updatedAt` set to 1 year in the future.
8.  **Blanket Read Attempt**: Authenticated user trying to `list` all users.
9.  **Monitor Scraping**: Authenticated user trying to `list` all active monitor sessions without knowing tokens.
10. **Incomplete Schema**: Creating a user document missing `encryptedPayload`.
11. **Type Poisoning**: Sending `updatedAt` as a string instead of a number in a monitor session.
12. **Update Hijack**: Changing the `userId` field of an existing user document.

## Test Runner (firestore.rules.test.ts placeholder)
(In a real CI, this would use the Firebase Emulators)
```typescript
// Pseudocode for verification
test('Dirty Dozen: Identity Spoof', () => {
  assertPermissionDenied(userA.write('/users/userB', { ... }));
});
// ... more tests
```
