package handlers

import (
	"net/http"
	"taskflow-api/database"
	"taskflow-api/models"
	"taskflow-api/utils"
)

// GetDashboard godoc
// @Summary Get user dashboard
// @Description Get dashboard statistics for the authenticated user
// @Tags Dashboard
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
func GetDashboard(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(
			w,
			http.StatusUnauthorized,
			"Unauthorized",
		)
		return
	}

	var dashboard models.Dashboard

	// --------------------------------
	// TOTAL PROJECTS
	// --------------------------------

	err := database.DB.QueryRow(
		`SELECT COUNT(*)
		 FROM projects
		 WHERE user_id = ?`,
		userID,
	).Scan(&dashboard.TotalProjects)

	if err != nil {
		utils.SendError(
			w,
			http.StatusInternalServerError,
			"Failed to fetch total projects",
		)
		return
	}

	// --------------------------------
	// TOTAL TASKS
	// --------------------------------

	err = database.DB.QueryRow(
		`SELECT COUNT(*)
		 FROM tasks t
		 INNER JOIN projects p
		 ON t.project_id = p.id
		 WHERE p.user_id = ?`,
		userID,
	).Scan(&dashboard.TotalTasks)

	if err != nil {
		utils.SendError(
			w,
			http.StatusInternalServerError,
			"Failed to fetch total tasks",
		)
		return
	}

	// --------------------------------
	// ACTIVE TASKS
	// --------------------------------

	err = database.DB.QueryRow(
		`SELECT COUNT(*)
		 FROM tasks t
		 INNER JOIN projects p
		 ON t.project_id = p.id
		 WHERE p.user_id = ?
		 AND t.status = 'active'`,
		userID,
	).Scan(&dashboard.ActiveTasks)

	if err != nil {
		utils.SendError(
			w,
			http.StatusInternalServerError,
			"Failed to fetch active tasks",
		)
		return
	}

	// --------------------------------
	// COMPLETED TASKS
	// --------------------------------

	err = database.DB.QueryRow(
		`SELECT COUNT(*)
		 FROM tasks t
		 INNER JOIN projects p
		 ON t.project_id = p.id
		 WHERE p.user_id = ?
		 AND t.status = 'completed'`,
		userID,
	).Scan(&dashboard.CompletedTasks)

	if err != nil {
		utils.SendError(
			w,
			http.StatusInternalServerError,
			"Failed to fetch completed tasks",
		)
		return
	}

	// --------------------------------
	// ARCHIVED TASKS
	// --------------------------------

	err = database.DB.QueryRow(
		`SELECT COUNT(*)
		 FROM tasks t
		 INNER JOIN projects p
		 ON t.project_id = p.id
		 WHERE p.user_id = ?
		 AND t.status = 'archived'`,
		userID,
	).Scan(&dashboard.ArchivedTasks)

	if err != nil {
		utils.SendError(
			w,
			http.StatusInternalServerError,
			"Failed to fetch archived tasks",
		)
		return
	}

	// --------------------------------
	// RESPONSE
	// --------------------------------

	utils.SendSuccess(
		w,
		http.StatusOK,
		"Dashboard fetched successfully",
		dashboard,
	)
}
