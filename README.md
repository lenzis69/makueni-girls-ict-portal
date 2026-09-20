# Makueni Girls ICT Students Portal

A starter full-stack portal for ICT students.

## Features
- Home page with department news
- About and Department sections
- Robotics section
- Student registration
- Username generated as `ADMNO@makuenigirls.sc.ke`
- Secure password hashing with bcrypt
- Student login
- Student work submission by subject
- Uploaded work download
- SQLite database
- Responsive mobile-friendly interface

## Run locally
1. Install Node.js 18+.
2. In this folder run:
   `npm install`
3. Start:
   `npm start`
4. Open:
   `http://localhost:3000`

## Important production notes
- Set a strong `SESSION_SECRET` environment variable.
- Use HTTPS.
- For a production school deployment, move uploads to object storage and SQLite to a managed database if scaling requires it.
- Add teacher/admin authentication before exposing teacher management functions.
- Configure backups and access controls.
- This starter currently allows student registration and student submissions; a teacher portal UI/backend should be added with role-based authorization before production use.
