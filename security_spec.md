# Security Specification

## Data Invariants
1. A Lead must have a valid structure (answers + analysis).
2. A Lead's `timestamp` must be the server time.
3. Users can create Leads (anonymous or logged in).
4. Only Admins can list or read all Leads.
5. Global stats can be incremented atomically.
6. Only Admins can modify global stats metadata directly (except for increments).

## The Dirty Dozen Payloads

### 1. Identity Spoofing
Try to create a lead with a hardcoded `userId` or spoofed `id` that belongs to another record.
### 2. State Shortcutting
Try to update a lead's category directly without going through the analysis logic (though analysis is client-side here, rules should restrict updates).
### 3. Resource Poisoning
Try to inject a 1MB string into the `id` field.
### 4. Admin Privilege Escalation
Try to add self to the `admins` collection.
### 5. PII Leak
Try to list all leads as a non-admin user.
### 6. Stats Corruption
Try to set `totalUsers` to 0 as a regular user.
### 7. Ghost Fields
Try to add `isAdmin: true` to a lead document.
### 8. Immutable Violation
Try to change the `timestamp` of an existing lead.
### 9. Unauthorized Deletion
Try to delete a lead as a regular user.
### 10. Large Payload
Try to send a payload that exceeds 1MB (handled by Firestore naturally, but rules can restrict sizes of strings).
### 11. Spoofing Email
Try to access admin routes with an unverified email.
### 12. Batch Atomicity Break
Try to create a lead without updating the global stats counter.

## Implementation details
- `isValidId(id)` helper.
- `isAdmin()` helper checking `/admins/$(request.auth.uid)`.
- `isValidLead()` validation function.
