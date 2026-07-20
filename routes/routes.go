package routes

import (
	"taskflow-api/handlers"

	"github.com/gorilla/mux"
)

func RegisterRoutes() *mux.Router {

	router := mux.NewRouter()

	router.HandleFunc("/register", handlers.Register).Methods("POST")

	router.HandleFunc("/login", handlers.Login).Methods("POST")

	router.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	return router
}
