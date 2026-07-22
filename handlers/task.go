package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"taskflow-api/database"
	"taskflow-api/models"
	"taskflow-api/utils"

	"github.com/gorilla/mux"
)

func CreateTask(w http.ResponseWriter, r *http.Request) {

	var task models.TaskRequest

	err := json.NewDecoder(r.Body).Decode(&task)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	task = utils.SanitizeTask(task)

	err = utils.ValidateTask(task)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)

	idStr := vars["id"]

	id, err := strconv.Atoi(idStr)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	var projectID int

	err = database.DB.QueryRow(
		`SELECT id
		FROM projects
		WHERE ID = ?
		AND user_id = ?`,
		id,
		userID,
	).Scan(&projectID)

	if err == sql.ErrNoRows {
		utils.SendError(w, http.StatusNotFound, "Project not found")
		return
	}

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}
	_, err = database.DB.Exec(
		`INSERT INTO tasks
		(project_id, title, description, status, due_date)
		VALUES (? , ? , ? , ?, ?)`,
		task.ProjectID,
		task.Title,
		task.Description,
		task.Status,
		task.DueDate,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusCreated,
		"Task created successfully",
		task,
	)
}

func GetTasks(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)

	idStr := vars["id"]

	id, err := strconv.Atoi(idStr)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	var projectID int

	err = database.DB.QueryRow(
		`SELECT id
		FROM projects
		WHERE id = ?
		AND user_id = ?`,
		id,
		userID,
	).Scan(&projectID)

	if err == sql.ErrNoRows {
		utils.SendError(w, http.StatusNotFound, "Project not found")
		return
	}
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	rows, err := database.DB.Query(
		`SELECT 
		id,
		project_id,
		title,
		description,
		status,
		due_date,
		created_at
		FROM tasks
		WHERE project_id = ?
		ORDER BY created_at DESC`,
		projectID,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	defer rows.Close()

	var tasks []models.TaskResponse

	for rows.Next() {

		var taskresponse models.TaskResponse

		err := rows.Scan(
			&taskresponse.ID,
			&taskresponse.ProjectID,
			&taskresponse.Title,
			&taskresponse.Description,
			&taskresponse.Status,
			&taskresponse.DueDate,
			&taskresponse.CreatedAT,
		)

		if err != nil {
			utils.SendError(w, http.StatusInternalServerError, "Failed to read tasks")
			return
		}

		tasks = append(tasks, taskresponse)

	}

	if err := rows.Err(); err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"Tasks fetched successfully",
		tasks,
	)

}
