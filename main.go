package main

import (
	"fmt"
	"net/http"
	"os"
	"taskflow-api/config"
	"taskflow-api/database"
	"taskflow-api/routes"
)

func main() {

	config.LoadEnv()

	database.InitDB()

	router := routes.RegisterRoutes()

	fmt.Println("Server starting...")

	port := ":" + os.Getenv("PORT")

	fmt.Println("🚀 Server running on", port)

	err := http.ListenAndServe(port, router)

	if err != nil {
		fmt.Println(err)
	}

}
