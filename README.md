# ☁️ Nexus Cloud

> A futuristic, full-stack file-sharing dashboard built with Node.js, Express, and vanilla HTML/CSS/JavaScript.

### 🚀 Live Demo

**[Visit Nexus Cloud →](https://nexus-cloud-1xs9.onrender.com/)**

Nexus Cloud provides a clean, glassmorphism-inspired interface for uploading, managing, and sharing files through a lightweight web application.

---

## ✨ Features

* 📤 **File Uploads** with Multer-powered backend handling
* 📁 **File Management** through a dedicated dashboard
* 🔐 **Admin Authentication** for protected upload and delete actions
* 🗂️ **File Metadata** persisted through JSON storage
* 🎨 **Modern Glassmorphism UI** with neon accents and responsive design
* 🔔 **Toast Notifications** for user feedback
* ⚡ **REST API** powered by Express
* 🌐 **Live Deployment** available through Render

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript

### Backend

* Node.js
* Express.js
* Multer

### Storage

* Local filesystem for uploaded files
* JSON-based metadata storage

### Deployment

* Render

---

## 🏗️ Project Structure

```text
Nexus-cloud/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/VoidArchitects/Nexus-cloud.git
cd Nexus-cloud
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
PORT=3000
UPLOAD_PASSWORD=your-secure-password
```

### 4. Start the server

```bash
npm start
```

The application will be available at:

```text
http://localhost:3000
```

---

## ☁️ Live Deployment

Nexus Cloud is deployed and publicly accessible through Render.

👉 **[Open the Live Application](https://nexus-cloud-1xs9.onrender.com/)**

For your own deployment, configure the required environment variables in your hosting provider's dashboard.

> **Note:** The current implementation uses local filesystem storage for uploaded files and JSON metadata. On hosting platforms using ephemeral storage, uploaded data may not persist across restarts or redeployments.

For a production-scale deployment, persistent object storage such as Amazon S3 or Cloudinary and a database such as PostgreSQL or MongoDB could be integrated.

---

## 🔐 Security

Admin-level operations are protected using a configured password through the `UPLOAD_PASSWORD` environment variable.

For production deployments:

* Use a strong, unique password
* Store secrets in environment variables
* Do not commit `.env` files
* Consider adding stronger authentication and authorization for multi-user deployments
* Consider validating file types and upload sizes according to your deployment requirements

---

## 🔮 Future Improvements

Potential improvements include:

* ☁️ Persistent cloud file storage
* 🗄️ Database-backed metadata
* 👤 Multi-user authentication
* 🔗 Shareable file links
* 📊 Storage and upload analytics
* 🔍 File search and filtering
* 🛡️ More granular access control
* 📱 Further mobile UI improvements

---

## 👨‍💻 Built By

**VoidArchitects**

A project focused on combining a lightweight Node.js backend with a polished, futuristic frontend experience.

---

### ⭐ Explore the Project

**[GitHub Repository](https://github.com/VoidArchitects/Nexus-cloud)**
**[Live Demo](https://nexus-cloud-1xs9.onrender.com/)**
