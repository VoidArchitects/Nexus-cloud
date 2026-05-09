# Nexus File Sharing (Full-Stack)

A premium, futuristic, glassmorphism-themed file-sharing dashboard and backend built with Node.js, Express, and pure HTML/CSS/JS.

## Features
- **Frontend**: Smooth Single Page Application (SPA) with glassmorphism UI, neon glow effects, and toast notifications.
- **Backend**: Express server with Multer for secure file uploads and API endpoints for file management.
- **Authentication**: Simple password protection for admin actions (Upload & Delete).
- **Storage**: Files are saved to the `uploads/` directory, and metadata is persisted in `data.json`.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   The `.env` file contains the port and your admin password.
   ```env
   PORT=3000
   UPLOAD_PASSWORD=nexus2026
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Deployment (Render, Railway, Heroku)

This project is fully ready for deployment on platforms like Render or Railway.

1. Create a new Web Service on Render/Railway.
2. Connect your GitHub repository containing this code.
3. Set the following Build Command:
   ```bash
   npm install
   ```
4. Set the following Start Command:
   ```bash
   npm start
   ```
5. **Important**: Add an environment variable in your deployment dashboard:
   - Key: `UPLOAD_PASSWORD`
   - Value: `<your-secure-password>`
   *(This ensures your dashboard is secure in production).*

Note: Since this app uses local disk storage (`uploads/` folder and `data.json`), deploying to an ephemeral server (like free-tier Render/Heroku) means files might be deleted when the server restarts. For a permanent production app, consider connecting an AWS S3 bucket (or Cloudinary) and a MongoDB database.
