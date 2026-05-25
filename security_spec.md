# Security Specification for Tracktion Firestore Access Control

## 1. Data Invariants
*   **User Identity Lock**: A user's profile under `users/{userId}` and their goals under `users/{userId}/goals/{goalId}` are strictly accessible for read, write, update, and delete ONLY by the authenticating user (`request.auth.uid == userId`).
*   **Input Integrity & Type Constraints**: Any custom goal must possess realistic boundary sizes (e.g., titles, categories, units, and tags can hover up to a 128 character budget).
*   **Temporal Stability**: Values like `joinedAt` or `createdAt` become immortal post-creation. No updates are permitted to bypass these.

---

## 2. The "Dirty Dozen" Payloads (Aesthetic Malice Avoided)
The following potential security-breaching payloads must be strictly blocked by our ruleset:

1.  **Identity Spoofing [UserProfile create]**: Creating or replacing someone else's user profile with custom user metrics.
2.  **Shadow Column injection [UserProfile update]**: Attempting to slip arbitrary fields like `{ "isVerifiedAdmin": true }` into a user profile.
3.  **Immortal field mutation [UserProfile update]**: Modifying the immutable `joinedAt` field of a profile.
4.  **PII Blanket Bypass [UserProfile read]**: Unauthenticated queries requesting access to personal tracking documents.
5.  **Path ID poisoning [Goal create]**: Injecting over-length junk characters as a Goal ID variable, which exhausts resources.
6.  **Immortal field mutation [Goal update]**: Mutating the `createdAt` timestamp parameter of an active Goal.
7.  **Negative values [Goal create/update]**: Passing negative numbers for completion tallies (`currentValue < 0` or `targetValue < 0`).
8.  **Empty Schema Shadow field [Goal create]**: Uploading random keys outside of the required `Goal` object shape.
9.  **Relational member hijacking [Goal delete]**: Deleting folders belonging to an entirely separate user profile.
10. **Resource flooding [Goal logs size override]**: Injecting an excessively long array of fake progress logs to trigger wallet denial.
11. **Type degradation [Goal category string mutation]**: Inserting booleans or numbers for fields validated to be typed as strings (such as `category`).
12. **Foreign identity attachment [Goal update]**: Forcing the payload's inner keys to point to another individual's auth UID.

---

## 3. Test Runner Design Architecture
A complete test runner scheme validating these rulesets using mock authentications:
```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

// Standard TDD check blocks asserting PERMISSION_DENIED on each of the Dirty Dozen.
```
