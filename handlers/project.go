package handlers

import (
	"encoding/json"
	"net/http"
	"taskflow-api/database"
	"taskflow-api/models"
	"taskflow-api/utils"
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
