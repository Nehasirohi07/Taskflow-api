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
