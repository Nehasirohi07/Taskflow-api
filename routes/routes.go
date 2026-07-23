package routes

import (
	"taskflow-api/handlers"
	"taskflow-api/middleware"

	"github.com/gorilla/mux"
)

func RegisterRoutes() *mux.Router {

	router := mux.NewRouter()

	router.Use(middleware.Logger)

	router.HandleFunc("/register", handlers.Register).Methods("POST")

	router.HandleFunc("/login", handlers.Login).Methods("POST")

	router.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	protected := router.PathPrefix("/").Subrouter()
	protected.Use(middleware.Auth)

	protected.HandleFunc("/projects", handlers.CreateProject).Methods("POST")
	protected.HandleFunc("/projects", handlers.GetProjects).Methods("GET")
	protected.HandleFunc("/projects", handlers.GetProjectByID).Methods("GET")
	protected.HandleFunc("/projects/{id}", handlers.UpdateProject).Methods("PUT")
	protected.HandleFunc("/projects/{id}", handlers.DeleteProject).Methods("DELETE")

	protected.HandleFunc("/projects/{id}/tasks", handlers.CreateTask).Methods("POST")
	protected.HandleFunc("/projects/{id}/tasks", handlers.GetTasks).Methods("GET")
	protected.HandleFunc("/tasks/{id}", handlers.GetTaskByID).Methods("GET")
	protected.HandleFunc("/tasks/{id}", handlers.UpdateTask).Methods("PUT")
	protected.HandleFunc("/tasks/{id}", handlers.DeleteTask).Methods("DELETE")

	return router
}
