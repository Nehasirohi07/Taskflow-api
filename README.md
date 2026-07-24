# 🚀 TaskFlow API

A production-ready Task Management REST API built with **Go (Golang)**, **Gorilla Mux**, **MySQL**, **JWT Authentication**, **Swagger Documentation**, and **Docker**.

This project provides secure authentication, role-based authorization, project management, task management, and admin functionalities.

---

# ✨ Features

## Authentication

- User Registration
- User Login
- Password Hashing (bcrypt)
- JWT Authentication
- Protected Routes

---

## Authorization

- User Role
- Admin Role
- Role-based Middleware
- Secure Access Control

---

## Projects

- Create Project
- Get All Projects
- Get Project by ID
- Update Project
- Delete Project

Each user can only access their own projects.

---

## Tasks

- Create Task
- Get All Tasks
- Get Task by ID
- Update Task
- Delete Task

Tasks belong to projects owned by the authenticated user.

---

## Admin

- Dashboard Statistics
- Get All Users
- Delete Users

Accessible only to Admin users.

---

## Health Check

- Health API

---

## Documentation

Interactive Swagger UI available at:

```
http://localhost:5051/swagger/index.html
```

---

# 🛠 Tech Stack

- Go
- Gorilla Mux
- MySQL
- JWT
- bcrypt
- Docker
- Swagger (Swaggo)

---

# 📁 Project Structure

```
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

DB_USER=root
DB_PASSWORD=root123
DB_HOST=localhost
DB_PORT=3306
DB_NAME=taskflow

JWT_SECRET=your-secret-key
```

---

## Run Project

```bash
go run main.go
```

---

# 🐳 Docker

Build

```bash
docker compose build
```

Run

```bash
docker compose up
```

Stop

```bash
docker compose down
```

---

# 📚 Swagger

Generate Docs

```bash
swag init
```

Swagger URL

```
http://localhost:5051/swagger/index.html
```

---

# 🔐 Authentication

Use Login API to obtain a JWT token.

Add the token in Swagger:

```
Bearer <your_token>
```

---

# 📌 API Modules

### Authentication

- POST /register
- POST /login

### Projects

- POST /projects
- GET /projects
- GET /projects/{id}
- PUT /projects/{id}
- DELETE /projects/{id}

### Tasks

- POST /projects/{id}/tasks
- GET /projects/{id}/tasks
- GET /tasks/{id}
- PUT /tasks/{id}
- DELETE /tasks/{id}

### Admin

- GET /admin/dashboard
- GET /admin/users
- DELETE /admin/users/{id}

### Health

- GET /health

---

# 🔒 Security

- Password Hashing using bcrypt
- JWT Authentication
- Role-Based Authorization
- Protected APIs
- Input Validation
- Request Sanitization

---

# 👨‍💻 Author

**Neha Sirohi**

GitHub:
https://github.com/Nehasirohi07

LinkedIn:
(Add your LinkedIn URL)

---

# ⭐ Future Improvements

- Pagination
- Search & Filtering
- Refresh Tokens
- Email Verification
- Password Reset
- Unit Testing
- CI/CD Pipeline
- Deployment