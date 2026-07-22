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
			&taskresponse.CreatedAt,
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

func GetTaskByID(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)

	idStr := vars["id"]

	id, err := strconv.Atoi(idStr)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}

	var task models.TaskResponse

	err = database.DB.QueryRow(
		`SELECT
		 	t.id,
	     	t.project_id,
		 	t.title,
		 	t.description,
		 	t.status,
			t.due_date,
			t.created_at
		 FROM tasks t
		 JOIN projects p
		 	ON t.project_id = p.id
		WHERE t.id = ? 
		AND p.user_id = ?`,
		id,
		userID,
	).Scan(
		&task.ID,
		&task.ProjectID,
		&task.Title,
		&task.Description,
		&task.Status,
		&task.DueDate,
		&task.CreatedAt,
	)

	if err == sql.ErrNoRows {
		utils.SendError(w, http.StatusNotFound, "Task not found")
		return
	}

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"Task fetched successfully",
		task,
	)

}

func UpdateTask(w http.ResponseWriter, r *http.Request) {

	var taskrequest models.TaskRequest

	err := json.NewDecoder(r.Body).Decode(&taskrequest)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	taskrequest = utils.SanitizeTask(taskrequest)

	err = utils.ValidateTask(taskrequest)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, err.Error())
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
		utils.SendError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}

	var taskID int

	err = database.DB.QueryRow(
		`SELECT t.id
		FROM tasks t
		JOIN projects p
		ON t.project_id = p.id
		WHERE t.id = ?
		AND p.user_id = ?`,
		id,
		userID,
	).Scan(&taskID)

	if err == sql.ErrNoRows {
		utils.SendError(w, http.StatusNotFound, "Task not found")
		return
	}

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	result, err := database.DB.Exec(
		`UPDATE tasks
		SET
		title = ?,
		description = ?,
		status = ?,
		due_date = ?,
		updated_at = NOW()
		WHERE id = ?`,
		taskrequest.Title,
		taskrequest.Description,
		taskrequest.Status,
		taskrequest.DueDate,
		id,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to update task")
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
		"Task updated successfully",
		nil,
	)

}
