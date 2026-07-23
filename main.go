package main

// @title TaskFlow API
// @version 1.0
// @description Task Management REST API built with Go, Gorilla Mux and MySQL.
// @host localhost:5051
// @BasePath /

import (
	"fmt"
	"net/http"
	"os"
	"taskflow-api/config"
	"taskflow-api/database"
	_ "taskflow-api/docs"
	"taskflow-api/routes"

	httpSwagger "github.com/swaggo/http-swagger"
)

func main() {

	config.LoadEnv()

	database.InitDB()

	router := routes.RegisterRoutes()

	router.PathPrefix("/swagger/").Handler(
		httpSwagger.WrapHandler,
	)

	fmt.Println("Server starting...")

	port := ":" + os.Getenv("PORT")

	fmt.Println("🚀 Server running on", port)

	err := http.ListenAndServe(port, router)

	if err != nil {
		fmt.Println(err)
	}

}
