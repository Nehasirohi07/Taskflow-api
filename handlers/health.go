package handlers

import (
	"encoding/json"
	"net/http"
)

// @Summary Health Check
// @Description Check if the API server is running
// @Tags Health
// @Produce json
// @Success 200 {object} utils.Response
// @Router /health [get]
func HealthCheck(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Context-Type", "application/json")

	w.WriteHeader(http.StatusOK)

	response := map[string]string{
		"status":  "success",
		"message": "TaskFlow API is running",
	}

	json.NewEncoder(w).Encode(response)
}
