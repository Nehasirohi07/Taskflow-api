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

// 	CreateProject godoc
// @Summary Create a new project
// @Description Create a new project for the authenticated user
// @Tags Projects
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param project body models.ProjectRequest true "Project Details"
// @Success 201 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /projects [post]

func CreateProject(w http.ResponseWriter, r *http.Request) {

	var project models.ProjectRequest

	err := json.NewDecoder(r.Body).Decode(&project)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid Request body")
		return
	}

	project = utils.SanitizeProject(project)

	err = utils.ValidateProject(project)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	_, err = database.DB.Exec(
		`INSERT INTO projects (user_id, title, description, status)
		VALUES(? , ? , ? , ?)`,
		userID,
		project.Title,
		project.Description,
		project.Status,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to create project")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusCreated,
		"Project created successfully",
		nil,
	)

}

// GetProjects godoc
// @Summary Get all projects
// @Description Get all projects of the authentication user
// @Tags Projects
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /projects [get]

func GetProjects(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	rows, err := database.DB.Query(
		`SELECT * FROM projects
		 WHERE user_id = ?`,
		userID,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	defer rows.Close()

	var projects []models.Project

	for rows.Next() {

		var project models.Project

		err := rows.Scan(
			&project.ID,
			&project.UserID,
			&project.Title,
			&project.Description,
			&project.Status,
			&project.CreatedAt,
		)

		if err != nil {
			utils.SendError(w, http.StatusInternalServerError, "Failed to read project")
			return
		}

		projects = append(projects, project)
	}

	if err := rows.Err(); err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"projects fetched successfully",
		projects,
	)

}

// GetProjectByID godoc
// @Summary Get project by ID
// @Description Get a single project by ID
// @Tags Projects
// @Produce json
// @Security BearerAuth
// @Param id path int true "Project ID"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /projects/{id} [get]

func GetProjectByID(w http.ResponseWriter, r *http.Request) {

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

	var project models.Project

	err = database.DB.QueryRow(
		`SELECT id, user_id, title, description, status, created_at
		 FROM projects
		 WHERE id = ? AND user_id = ?`,
		id,
		userID,
	).Scan(

		&project.ID,
		&project.UserID,
		&project.Title,
		&project.Description,
		&project.Status,
		&project.CreatedAt,
	)

	if err == sql.ErrNoRows {
		utils.SendError(w, http.StatusNotFound, "Project not found")
		return
	}

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"project fetched successfully",
		project,
	)

}

// UpdateProject godoc
// @Summary Update project
// @Description Update an existing project
// @Tags Projects
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Project ID"
// @Param project body models.ProjectRequest true "Update Project"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /projects/{id} [put]

func UpdateProject(w http.ResponseWriter, r *http.Request) {

	var project models.ProjectRequest

	err := json.NewDecoder(r.Body).Decode(&project)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	project = utils.SanitizeProject(project)

	err = utils.ValidateProject(project)

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
		utils.SendError(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	var projectID int

	err = database.DB.QueryRow(
		`SELECT id
		FROM projects
		WHERE id = ? AND user_id = ?`,
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
		`UPDATE projects 
		SET 
		title = ?,
		description = ?,
		status = ?,
		updated_at = ? 
		WHERE id = ? AND user_id = ?`,
		id,
		userID,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "database error")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"project updated successfully",
		nil,
	)

}

// DeleteProject godoc
// @Summary Delete project
// @Description Delete a project by ID
// @Tags Projects
// @Produce json
// @Security BearerAuth
// @Param id path int true "Project ID"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /projects/{id} [delete]

func DeleteProject(w http.ResponseWriter, r *http.Request) {

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
		WHERE id = ? AND user_id = ?`,
		id,
		userID,
	).Scan(&projectID)

	if err != nil {
		utils.SendError(w, http.StatusNotFound, "Project not found")
		return
	}

	result, err := database.DB.Exec(
		`DELETE FROM projects
		WHERE id = ? AND user_id = ?`,
		id,
		userID,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to delete project")
		return
	}
	affectedRows, err := result.RowsAffected()

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "database error")
		return
	}

	if affectedRows == 0 {
		utils.SendError(w, http.StatusNotFound, "No record affected")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"project deleted successfully",
		map[string]interface{}{
			"deleted_rows": affectedRows,
		},
	)
}
