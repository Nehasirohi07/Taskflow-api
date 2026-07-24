# 🚀 TaskFlow API

A production-ready Task Management REST API built with **Go (Golang)**, **Gorilla Mux**, **MySQL**, **JWT Authentication**, **Swagger Documentation**, and **Docker**.

This project provides secure authentication, role-based authorization, project management, task management, and admin functionalities.

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- Password Hashing (bcrypt)
- JWT Authentication
- Protected Routes

---

## 🛡 Authorization

- User Role
- Admin Role
- Role-Based Middleware
- Secure Access Control

---

## 📁 Projects

- Create Project
- Get All Projects
- Get Project by ID
- Update Project
- Delete Project

Each user can only access their own projects.

---

## ✅ Tasks

- Create Task
- Get All Tasks
- Get Task by ID
- Update Task
- Delete Task

Tasks belong to projects owned by the authenticated user.

---

## 👑 Admin

- Dashboard Statistics
- Get All Users
- Delete Users

Accessible only to Admin users.

---

## ❤️ Health Check

- Health API

---

# 📚 API Documentation

Interactive Swagger UI is available at:

```
http://localhost:5051/swagger/index.html
```

---

# 🛠 Tech Stack

- Go (Golang)
- Gorilla Mux
- MySQL
- JWT Authentication
- bcrypt
- Docker
- Swagger (Swaggo)

---

# 📁 Project Structure

```text
taskflow-api/
│
├── config/
├── database/
├── docs/
├── handlers/
├── middleware/
├── models/
├── routes/
├── utils/
├── .env
├── docker-compose.yml
├── Dockerfile
├── go.mod
└── main.go
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Nehasirohi07/Taskflow-api.git

cd Taskflow-api
```

---

## Install Dependencies

```bash
go mod tidy
```

---

## Configure Environment

Create a `.env` file.

Example:

```env
PORT=5051

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=taskflow

JWT_SECRET=your_jwt_secret
```

---

## Run Project

```bash
go run main.go
```

---

# 🐳 Docker

### Build

```bash
docker compose build
```

### Start Containers

```bash
docker compose up
```

### Stop Containers

```bash
docker compose down
```

---

# 📖 Swagger Documentation

Generate Swagger files:

```bash
swag init
```

Open Swagger UI:

```
http://localhost:5051/swagger/index.html
```

---

# 🔑 Authentication

Login using the **/login** endpoint to obtain a JWT token.

Use the token in Swagger:

```
Bearer <your_token>
```

---

# 📌 API Modules

## Authentication

- POST `/register`
- POST `/login`

### Projects

- POST `/projects`
- GET `/projects`
- GET `/projects/{id}`
- PUT `/projects/{id}`
- DELETE `/projects/{id}`

### Tasks

- POST `/projects/{id}/tasks`
- GET `/projects/{id}/tasks`
- GET `/tasks/{id}`
- PUT `/tasks/{id}`
- DELETE `/tasks/{id}`

### Admin

- GET `/admin/dashboard`
- GET `/admin/users`
- DELETE `/admin/users/{id}`

### Health

- GET `/health`

---

# 🔒 Security Features

- Password Hashing using bcrypt
- JWT Authentication
- Role-Based Authorization
- Protected APIs
- Input Validation
- Request Sanitization

---

# 👨‍💻 Author

**Neha Sirohi**

**GitHub:**  
https://github.com/Nehasirohi07

**LinkedIn:**  
(Add your LinkedIn Profile)

---

# 🚀 Future Improvements

- Pagination
- Search & Filtering
- Refresh Tokens
- Email Verification
- Password Reset
- Unit Testing
- CI/CD Pipeline
- Deployment

---

## ⭐ If you found this project useful, consider giving it a star on GitHub!