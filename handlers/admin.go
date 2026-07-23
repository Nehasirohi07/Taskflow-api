package handlers

import (
	"net/http"
	"taskflow-api/database"
	"taskflow-api/models"
	"taskflow-api/utils"
)

func GetAdminDashboard(w http.ResponseWriter, r *http.Request) {

	var dashboard models.AdminDashboard

	err := database.DB.QueryRow(
		`SELECT COUNT(*)
		FROM users`,
	).Scan(&dashboard.TotalUsers)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	err = database.DB.QueryRow(
		`SELECT COUNT(*)
		FROM projects`,
	).Scan(&dashboard.TotalProjects)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	err = database.DB.QueryRow(
		`SELECT COUNT(*)
		FROM tasks`,
	).Scan(&dashboard.TotalTasks)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"Admin dashboard fetched successfully",
		dashboard,
	)

}
