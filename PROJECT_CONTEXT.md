# 🚨 MASTER AI DEVELOPMENT CONTEXT

## 📌 Project

This is a team-based software project.

Multiple developers may work on different branches and different features.

The AI must protect other developers' work and must NOT accidentally modify their code.

The AI must work primarily on **my current branch and my assigned feature only**.

---

# 🌿 1. BRANCH SAFETY — VERY IMPORTANT

## My Branch

The current checked-out branch is considered **MY BRANCH**.

The AI may modify code that belongs to my current branch when it is required for my assigned feature.

### Main rule:

> **Do NOT modify code belonging to another developer's branch/feature unless it is absolutely necessary for my feature to work.**

Never rewrite another developer's feature just because you prefer a different implementation.

Never refactor another developer's code unnecessarily.

Never replace working code with a different architecture without a real requirement.

---

# 👨‍💻 2. OTHER DEVELOPER'S CODE

If a file/code section clearly belongs to another developer:

### Default behavior

**DO NOT CHANGE IT.**

Instead:

1. Reuse the existing logic if possible.
2. Build my feature around the existing logic.
3. Do not refactor it unnecessarily.
4. Do not rename their functions/components unnecessarily.
5. Do not change their architecture unnecessarily.

---

# ⚠️ 3. WHEN OTHER DEVELOPER'S CODE MUST BE CHANGED

Sometimes another developer's code may directly conflict with my feature.

Only in that situation may the AI modify that code.

Before changing it:

### Step 1

Identify exactly:

* What code belongs to the other developer
* Developer name/ownership if known
* Why it conflicts with my feature
* Why changing it is necessary

### Step 2

Keep the previous logic visible by commenting it out.

Example:

```ts
// Previous logic by: Developer Name
// Kept for reference because this logic conflicts with the new requirement.
//
// const oldLogic = ...

// New logic for: My Feature
const newLogic = ...
```

### Step 3

Clearly mention why the old logic was replaced.

Example:

```ts
// Changed because the previous logic was sending an OTP
// after an incorrect password.
// This feature must NOT send OTP after a failed login.
```

### Important

Do NOT delete another developer's logic without explanation when a replacement is required.

---

# 🌎 4. GLOBAL / SHARED CODE

Some code may be global/shared and used by multiple features.

Examples:

* Shared components
* Common utilities
* API configuration
* Environment configuration
* Common types
* Shared UI components
* Common authentication helpers
* Global constants

If existing global code already contains the required logic:

> **Reuse the existing logic instead of creating duplicate logic.**

If the existing global logic is correct:

```text
Reuse it.
Do not duplicate it.
```

If the existing global logic has a bug:

### Do NOT silently change it.

First identify:

```text
Where is the bug?
Why is it a bug?
Which feature is affected?
Will changing it affect other developers?
```

Then make the smallest safe change.

Add a clear comment when the change may affect shared behavior.

Example:

```ts
// Existing shared logic.
// Bug: this condition also triggers OTP for incorrect passwords.
// Fixed for login flow.
// Original behavior kept in comment for reference.
```

---

# 📝 5. DEVELOPER OWNERSHIP

If the code being changed belongs to another developer and their name is known, mention their name in the comment.

Example:

```ts
// Previous implementation by: Rakib
// Kept commented because this implementation sends OTP
// after failed password authentication.
//
// const oldLoginFlow = ...

// Updated implementation for: Shakib's login feature
const loginFlow = ...
```

If the developer name is NOT known:

```ts
// Previous implementation by: Unknown/Existing Developer
```

Do NOT invent a developer name.

---

# 🧩 6. DO NOT OVERWRITE WORKING CODE

Never make changes just because:

* You prefer another coding style
* You want to refactor
* You want to rename something
* You want to reorganize folders
* You want to use a design pattern
* You want to make the code "cleaner"

Only change what is required.

### Priority:

```text
Existing working code
        ↓
Reuse it
        ↓
Smallest required change
        ↓
Test
        ↓
Only then continue
```

---

# 🖥️ 7. LOCAL vs LIVE ENVIRONMENT

The project has two environments:

## Local Development

Local development is used for:

* Coding
* Debugging
* Testing
* Fixing errors
* Feature validation

## Live Environment

Live environment is used only after the local implementation passes completely.

---

# 🔌 8. DIFFERENT PORTS FOR LOCAL AND LIVE

Local development and Live API must never be confused.

Use separate configuration for each environment.

### Local

Example:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

If the local backend uses another port, use that backend port explicitly.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Live

Example:

```env
NEXT_PUBLIC_API_URL=https://trust-pass-server.vercel.app
```

Do NOT hardcode Live URLs throughout the application.

Use environment variables.

---

# 🚨 9. LOCAL TEST MUST PASS FIRST

This is a strict requirement.

### Development order:

```text
Write code
   ↓
Run locally
   ↓
Debug locally
   ↓
Fix all errors
   ↓
Test complete feature locally
   ↓
Confirm local feature works
   ↓
ONLY THEN test/use Live API
```

Do NOT move to Live testing while the local implementation is still broken.

---

# 🧪 10. LOCAL TESTING REQUIREMENT

Before considering a feature complete:

Check:

* UI works
* API request works
* API response works
* Error handling works
* Loading state works
* Success state works
* Invalid input works
* Edge cases work
* Browser console has no relevant errors
* Network request is going to the correct environment
* No accidental localhost/Live URL mixing

---

# 🧑‍💻 11. CODE MUST BE 100% JUNIOR-DEVELOPER FRIENDLY

All code must be:

* Simple
* Readable
* Predictable
* Easy to debug
* Easy to modify
* Easy to understand

Avoid unnecessary complexity.

### Prefer:

```ts
const response = await fetch(url, options);

const data = await response.json();

if (!response.ok) {
  throw new Error(data.message || "Something went wrong");
}
```

over unnecessarily complicated abstractions.

---

# 🚫 12. AVOID OVER-ENGINEERING

Do NOT introduce:

* Complex design patterns
* Repository patterns
* Service layers unless already required
* Dependency injection
* Complex custom hooks
* Redux unless already required
* Context unless already required
* Unnecessary state management
* Unnecessary abstraction layers
* Huge utility files
* Complicated generic TypeScript
* Unnecessary libraries

Keep the implementation straightforward.

---

# 🐛 13. DEBUGGABILITY

Every important operation should be easy to debug.

Use clear variable names.

Bad:

```ts
const d = await r.json();
```

Good:

```ts
const responseData = await response.json();
```

Bad:

```ts
if (!x) return;
```

Good:

```ts
if (!email) {
  setError("Email is required");
  return;
}
```

Errors should clearly indicate what went wrong.

---

# 🔍 14. DO NOT HIDE ERRORS

Do not silently swallow API errors.

Bad:

```ts
try {
  await fetch(url);
} catch {
}
```

Good:

```ts
try {
  const response = await fetch(url);

  const responseData = await response.json();

  if (!response.ok) {
    setError(responseData.message || "Request failed");
    return;
  }
} catch (error) {
  console.error("API request failed:", error);
  setError("Something went wrong. Please try again.");
}
```

---

# 👨‍💻 15. SHAKIBUL'S SCOPE

When the active developer is **Shakibul** (including work on Shakibul's branch), the AI must focus only on the UI/UX, functionality, API integration, and testing for the features listed below. Do not take on unrelated features or modify another developer's work. Keep changes limited to what is needed for an item in this scope.

## Authentication and profile

1. Login, registration, and authentication flow UI
2. Profile management UI
3. Password reset UI flow
4. Profile photo upload component

## Buyer business management

5. Buyer business creation form
6. Category selector component in the business creation wizard
7. Buyer business management dashboard
8. Business address update form
9. Business document upload manager, including Trade License and NID/TIN documents

## Buyer products, trust, and reports

10. Buyer product add form
11. Buyer product edit form
12. Buyer product delete functionality
13. Buyer document status indicators connected to document status data
14. Business trust score UI badge
15. Trust score breakdown modal
16. Report submission modal for buyers and customers

## Access, integration, and payments

17. RBAC route guard and buyer access control
18. Backend integration and full authentication/business flow testing
19. Notification toast and alert integration
20. Buyer fee payment checkout UI
21. Payment success and failure result pages
22. Buyer payment history table

## Quality and usability

23. Pagination, search, and sorting on buyer tables
24. Edge case fixes on buyer forms
25. End-to-end testing for registration, business creation, document upload, and payment
26. Mobile responsiveness and UI polish
27. Sanity checks for buyer and authentication flows

The list is a scope boundary, not a requirement to implement all items at once. Work only on the item requested for the current task, follow the existing branch safety rules, and reuse existing shared logic where possible.

# 🔐 16. AUTHENTICATION API DETAILS

Within Shakibul's scope, authentication work includes login, registration, password reset, and related authentication UI and integration. Apply the API behavior below when working on the corresponding flow. Do NOT work on authentication features outside the scope above unless explicitly assigned.

---

## 16.1 LOGIN

### Live API

```text
POST https://trust-pass-server.vercel.app/api/auth/sign-in/email
```

### Required behavior

Correct credentials:

```text
Login successful
```

Wrong password:

```text
Show error
NO OTP
NO OTP EMAIL
```

### VERY IMPORTANT

> **Wrong password must NEVER trigger an OTP email.**

Do not call any OTP endpoint after failed login.

---

## 16.2 FORGOT PASSWORD

### Request password reset

```text
POST https://trust-pass-server.vercel.app/api/auth/request-password-reset
```

### Reset password

```text
POST https://trust-pass-server.vercel.app/api/auth/reset-password
```

Use the Live API for the password reset flow.

Do NOT create a local email system.

Do NOT use:

* Nodemailer
* Local SMTP
* Local mail server
* Direct Resend frontend implementation

---

## 16.3 PASSWORD CHANGE

### Endpoint

```text
POST https://trust-pass-server.vercel.app/api/auth/change-password
```

Use the Live API.

Do not implement password changing with local-only logic.

---

# 🚫 19. LOCAL SERVER RULE

Do NOT modify local server code for these features unless the user explicitly changes this rule.

The frontend should communicate with the configured API environment.

Do not secretly create another backend implementation.

---

# 🚫 20. GIT RULE

Do not:

* Run Git commands automatically
* Merge branches automatically
* Rebase automatically
* Resolve conflicts automatically
* Reset branches
* Delete branches
* Commit changes
* Push changes
* Pull changes
* Rewrite another developer's branch

If Git action becomes necessary:

> Stop and tell the user what needs to be done.

The user will perform the Git operation.

---

# 📦 21. ONE STEP AT A TIME

Never provide the entire implementation at once.

Use this process:

```text
Step 1
↓
Explain
↓
Change one file
↓
Test
↓
Wait

Step 2
↓
Explain
↓
Change next file
↓
Test
↓
Wait
```

---

# 📄 22. EVERY STEP MUST SAY

Before giving code, always say:

### File

Which file will be changed.

### Why

Why this file needs to change.

### What

What exactly will be changed.

### Test

How to test the change locally.

---

# 🎯 23. CHANGE ONLY WHAT IS NECESSARY

Before changing a file, ask:

```text
Is this file required for my feature?
```

If NO:

> Do not change it.

If YES:

> Make the smallest necessary change.

---

# 🧠 24. REUSE EXISTING LOGIC

Before creating new logic:

1. Check whether the current branch already has the required logic.
2. If yes → reuse it.
3. If shared/global code has the logic → reuse it.
4. Do not duplicate functionality.
5. If existing logic is wrong → identify the exact problem first.

---

# ⚠️ 25. IF EXISTING LOGIC IS WRONG

Do not blindly replace it.

Explain:

```text
Existing logic:
...

Problem:
...

Why it is wrong:
...

Required behavior:
...

Smallest fix:
...
```

Then make the smallest safe change.

---

# 👨‍💻 26. OTHER DEVELOPER'S CODE — FINAL RULE

### Default:

```text
Other developer's code
        ↓
DO NOT CHANGE
        ↓
Reuse it if possible
```

### Exception:

```text
Other developer's code
        ↓
Directly blocks required feature
        ↓
Explain why
        ↓
Comment previous logic
        ↓
Mention developer name if known
        ↓
Add smallest required replacement
        ↓
Test locally
```

---

# 🛑 27. STOP CONDITIONS

Stop and ask the user before continuing if:

* Another developer's code must be changed and ownership/impact is unclear.
* A global change may break another feature.
* A Git operation is required.
* A database migration is required.
* The Live API contract is unclear.
* The local API behavior differs from the documented behavior.
* A required endpoint is missing.
* The implementation requires changing unrelated features.

Do NOT guess.

---

# ✅ FINAL DEVELOPMENT PRINCIPLE

Always follow:

```text
MY BRANCH
   ↓
MY FEATURE
   ↓
REUSE EXISTING GLOBAL LOGIC
   ↓
DO NOT TOUCH OTHER DEVELOPER'S CODE
   ↓
IF CHANGE IS ABSOLUTELY REQUIRED
   ↓
COMMENT OLD LOGIC + DEVELOPER NAME
   ↓
ADD SMALLEST SAFE CHANGE
   ↓
KEEP CODE JUNIOR-FRIENDLY
   ↓
TEST LOCALLY
   ↓
LOCAL MUST PASS COMPLETELY
   ↓
ONLY THEN TEST LIVE
```

## 🎯 Main Goal

Produce code that is:

**Simple + Readable + Debuggable + Safe for Team Development**

while protecting other developers' work and keeping the current branch focused on the assigned feature.
