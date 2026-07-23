package handlers

import (
	"net/http"
	"taskflow-api/database"
	"taskflow-api/models"
	"taskflow-api/utils"
)

func GetDashboard(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var dashboard models.Dashboard

	// var Totalprojects int

	err := database.DB.QueryRow(
		`SELECT COUNT(*)
		FROM projects
		WHERE user_id = ?`,
		userID,
	).Scan(&dashboard.TotalProjects)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	err = database.DB.QueryRow(
		`SELECT COUNT(*)
		FROM tasks t
		JOIN projects p
		ON t.project_id = p.id
		WHERE p.user_id = ?`,
		userID,
	).Scan(&dashboard.TotalTasks)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	err = database.DB.QueryRow(
		`SELECT COUNT(*)
		FROM tasks t
		JOIN projects p
		ON t.project_id = p.id
		WHERE p.user_id = ?
		AND t.status = 'completed'`,
		userID,
	).Scan(&dashboard.CompletedTasks)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	err = database.DB.QueryRow(
		`SELECT COUNT(*)
		FROM tasks t
		JOIN projects p
		ON t.project_id = p.id 
		WHERE p.user_id = ?
		AND t.status = "pending"`,
		userID,
	).Scan(&dashboard.PendingTasks)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	err = database.DB.QueryRow(
		`SELECT COUNT(*)
		FROM tasks t
		JOIN projects p
		ON t.projects_id = p.id
		WHERE p.user_id = ?
		AND t.status = "in_progress"`,
		userID,
	).Scan(&dashboard.InProgressTasks)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"Dashboard fetched successfully",
		dashboard,
	)
}
