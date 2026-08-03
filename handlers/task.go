package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"taskflow-api/database"
	"taskflow-api/models"
	"taskflow-api/utils"

	"github.com/gorilla/mux"
)

// CreateTask godoc
// @Summary Create a new task
// @Description Create a task under a specific project
// @Tags Tasks
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Project ID"
// @Param task body models.TaskRequest true "Task Details"
// @Success 201 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /projects/{id}/tasks [post]
func CreateTask(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get project ID from URL
	vars := mux.Vars(r)

	idStr := vars["id"]

	projectID, err := strconv.Atoi(idStr)

	if err != nil || projectID <= 0 {
		utils.SendError(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	// Decode request body
	var task models.TaskRequest

	err = json.NewDecoder(r.Body).Decode(&task)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Always use the project ID from the URL
	task.ProjectID = projectID

	// Sanitize
	task = utils.SanitizeTask(task)

	// Validate
	err = utils.ValidateTask(task)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Verify that project belongs to logged-in user
	var existingProjectID int

	err = database.DB.QueryRow(
		`SELECT id
		 FROM projects
		 WHERE id = ?
		 AND user_id = ?`,
		projectID,
		userID,
	).Scan(&existingProjectID)

	if err == sql.ErrNoRows {
		utils.SendError(w, http.StatusNotFound, "Project not found")
		return
	}

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	// Create task
	result, err := database.DB.Exec(
		`INSERT INTO tasks
		(project_id, title, description, status, due_date)
		VALUES (?, ?, ?, ?, ?)`,
		projectID,
		task.Title,
		task.Description,
		task.Status,
		task.DueDate,
	)

	if err != nil {
		log.Println("CREATE TASK DATABASE ERROR:", err)
		utils.SendError(w, http.StatusInternalServerError, "Failed to create task")
		return
	}

	taskID, err := result.LastInsertId()

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to get task ID")
		return
	}

	// Fetch created task
	var response models.TaskResponse

	err = database.DB.QueryRow(
		`SELECT
			id,
			project_id,
			title,
			description,
			status,
			due_date,
			created_at,
			updated_at
		 FROM tasks
		 WHERE id = ?`,
		taskID,
	).Scan(
		&response.ID,
		&response.ProjectID,
		&response.Title,
		&response.Description,
		&response.Status,
		&response.DueDate,
		&response.CreatedAt,
		&response.UpdatedAt,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to fetch created task")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusCreated,
		"Task created successfully",
		response,
	)
}

// GetTasks godoc
// @Summary Get all tasks
// @Description Get all tasks for a specific project
// @Tags Tasks
// @Produce json
// @Security BearerAuth
// @Param id path int true "Project ID"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /projects/{id}/tasks [get]
func GetTasks(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)

	idStr := vars["id"]

	projectID, err := strconv.Atoi(idStr)

	if err != nil || projectID <= 0 {
		utils.SendError(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	// Verify project ownership
	var existingProjectID int

	err = database.DB.QueryRow(
		`SELECT id
		 FROM projects
		 WHERE id = ?
		 AND user_id = ?`,
		projectID,
		userID,
	).Scan(&existingProjectID)

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
			created_at,
			updated_at
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

	tasks := make([]models.TaskResponse, 0)

	for rows.Next() {

		var task models.TaskResponse

		err := rows.Scan(
			&task.ID,
			&task.ProjectID,
			&task.Title,
			&task.Description,
			&task.Status,
			&task.DueDate,
			&task.CreatedAt,
			&task.UpdatedAt,
		)

		if err != nil {
			utils.SendError(w, http.StatusInternalServerError, "Failed to read tasks")
			return
		}

		tasks = append(tasks, task)
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

// GetTaskByID godoc
// @Summary Get task by ID
// @Description Get a single task
// @Tags Tasks
// @Produce json
// @Security BearerAuth
// @Param id path int true "Task ID"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /tasks/{id} [get]
func GetTaskByID(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)

	idStr := vars["id"]

	taskID, err := strconv.Atoi(idStr)

	if err != nil || taskID <= 0 {
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
			t.created_at,
			t.updated_at
		 FROM tasks t
		 JOIN projects p
			ON t.project_id = p.id
		 WHERE t.id = ?
		 AND p.user_id = ?`,
		taskID,
		userID,
	).Scan(
		&task.ID,
		&task.ProjectID,
		&task.Title,
		&task.Description,
		&task.Status,
		&task.DueDate,
		&task.CreatedAt,
		&task.UpdatedAt,
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

// UpdateTask godoc
// @Summary Update task
// @Description Update an existing task
// @Tags Tasks
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Task ID"
// @Param task body models.TaskRequest true "Update Task"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /tasks/{id} [put]
func UpdateTask(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)

	idStr := vars["id"]

	taskID, err := strconv.Atoi(idStr)

	if err != nil || taskID <= 0 {
		utils.SendError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}

	var taskRequest models.TaskRequest

	err = json.NewDecoder(r.Body).Decode(&taskRequest)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	taskRequest = utils.SanitizeTask(taskRequest)

	err = utils.ValidateTask(taskRequest)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Verify task belongs to user's project
	var existingTaskID int

	err = database.DB.QueryRow(
		`SELECT t.id
		 FROM tasks t
		 JOIN projects p
			ON t.project_id = p.id
		 WHERE t.id = ?
		 AND p.user_id = ?`,
		taskID,
		userID,
	).Scan(&existingTaskID)

	if err == sql.ErrNoRows {
		utils.SendError(w, http.StatusNotFound, "Task not found")
		return
	}

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	_, err = database.DB.Exec(
		`UPDATE tasks
		 SET
			title = ?,
			description = ?,
			status = ?,
			due_date = ?,
			updated_at = NOW()
		 WHERE id = ?`,
		taskRequest.Title,
		taskRequest.Description,
		taskRequest.Status,
		taskRequest.DueDate,
		taskID,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to update task")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"Task updated successfully",
		nil,
	)
}

// DeleteTask godoc
// @Summary Delete task
// @Description Delete a task by ID
// @Tags Tasks
// @Produce json
// @Security BearerAuth
// @Param id path int true "Task ID"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /tasks/{id} [delete]
func DeleteTask(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)

	idStr := vars["id"]

	taskID, err := strconv.Atoi(idStr)

	if err != nil || taskID <= 0 {
		utils.SendError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}

	// Verify task belongs to user's project
	var existingTaskID int

	err = database.DB.QueryRow(
		`SELECT t.id
		 FROM tasks t
		 JOIN projects p
			ON t.project_id = p.id
		 WHERE t.id = ?
		 AND p.user_id = ?`,
		taskID,
		userID,
	).Scan(&existingTaskID)

	if err == sql.ErrNoRows {
		utils.SendError(w, http.StatusNotFound, "Task not found")
		return
	}

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	_, err = database.DB.Exec(
		`DELETE FROM tasks
		 WHERE id = ?`,
		taskID,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to delete task")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"Task deleted successfully",
		nil,
	)
}
