package handlers

import (
	"encoding/json"
	"net/http"
)

func HealthCheck(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Context-Type", "application/json")

	w.WriteHeader(http.StatusOK)

	response := map[string]string{
		"status":  "success",
		"message": "TaskFlow API is running",
	}

	json.NewEncoder(w).Encode(response)
}
