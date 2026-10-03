# Project Guidelines & Operating Rules (Issue & Project Management System)

## 1. Architecture & File Rules
- **Clean Layered Architecture**: Strictly follow `Routes` -> `Middlewares` -> `Controllers` -> `Services` -> `Models`.
- **Module System**: Use ESM Modules (`import` / `export`).
- **File Length Limit**: Keep every file strictly under 200 lines of code.

## 2. STRICT File Creation Policy
- **NO Extra Files**: NEVER create, write, or modify temporary/status/summary files (e.g., `.md`, `.txt`, `status.txt`, `end.txt`, `final.txt`, `TASK_X_SUMMARY.md`).
- **Terminal-Only Status**: Output status updates strictly as brief plain text directly in the terminal output (STDOUT).
- **Explicit Command Exception**: Only create markdown documentation if explicitly commanded with the exact phrase: `"Create a summary file"`.

## 3. Security & Business Logic Rules
- **Public Registration Limits**: Zod validation schema for registration MUST ONLY allow `['PROJECT_MANAGER', 'DEVELOPER']`.
- **Privilege Escalation Prevention**: Strictly prohibit `'ADMIN'` from public registration inputs. The `ADMIN` role is only assigned manually in MongoDB.
- **Data Protection**: Use `select: false` on password fields, hash passwords using `bcryptjs` (salt 12) inside Mongoose `pre('save')` hook, and use `isModified('password')`.

## 4. Error Handling Standards
- Use the custom `AppError` class for all operational errors.
- Wrap all async controller handlers with `catchAsync`.
- Always pass errors to the global error handling middleware via `next(err)`.

## 5. Frequently Used Commands
- **Run Development**: `npm run dev`
- **Install Dependencies**: `npm install`