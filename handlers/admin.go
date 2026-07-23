package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"taskflow-api/database"
	"taskflow-api/models"
	"taskflow-api/utils"

	"github.com/gorilla/mux"
)

// GetAdminDashboard godoc
// @Summary Get admin dashboard
// @Description Get overall  statistics for admin
// @Tags Admin
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 403 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /admin/dashboard [get]

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

// GetAllUsers godoc
// @Summary Get all users
// @Description Get all registered users (Admin only)
// @Tags Admin
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 403 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /admin/users [get]

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

// DeleteUser godoc
// @Summary Delete user
// @Description Delete a user by ID (Admin only)
// @Tags Admin
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 403 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /admin/users/{id} [delete]

func DeleteUser(w http.ResponseWriter, r *http.Request) {

	adminID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)

	idStr := vars["id"]

	id, err := strconv.Atoi(idStr)

	if err != nil {
		utils.SendError(w, http.StatusNotFound, "user ID not found")
		return
	}

	if id == adminID {
		utils.SendError(w, http.StatusBadRequest, "you cannot delete your own account")
		return
	}

	var usersID int

	err = database.DB.QueryRow(
		`SELECT id
		FROM users
		WHERE id = ?`,
		id,
	).Scan(&usersID)

	if err == sql.ErrNoRows {
		utils.SendError(w, http.StatusNotFound, "User not found")
		return
	}

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	result, err := database.DB.Exec(
		`DELETE FROM users
		WHERE id = ?`,
		id,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	affectedRows, err := result.RowsAffected()

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	if affectedRows == 0 {
		utils.SendError(w, http.StatusNotFound, "no record affected")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"User deleted successfully",
		nil,
	)

}
