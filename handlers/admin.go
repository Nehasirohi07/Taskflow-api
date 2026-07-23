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

func GetAllUsers(w http.ResponseWriter, r *http.Request) {

	rows, err := database.DB.Query(
		`SELECT
			id,
			name,
			email,
			role,
			created_at
		FROM users
		ORDER BY created_at DESC;`,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	defer rows.Close()

	var users []models.AdminUser

	for rows.Next() {

		var user models.AdminUser

		err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.Role,
			&user.CreatedAt,
		)

		if err != nil {
			utils.SendError(w, http.StatusInternalServerError, "Databasee error")
			return
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"Users fetched successfully",
		users,
	)

}
