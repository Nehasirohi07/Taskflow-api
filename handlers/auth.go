package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"taskflow-api/database"
	"taskflow-api/models"
	"taskflow-api/utils"
)

func Register(w http.ResponseWriter, r *http.Request) {

	var user models.User

	err := json.NewDecoder(r.Body).Decode(&user)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user = utils.SanitizeUser(user)

	err = utils.ValidateUser(user)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	hashedPassword, err := utils.HashPassword(user.Password)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	user.Password = hashedPassword

	var existingID int

	err = database.DB.QueryRow(
		"SELECT id FROM users WHERE email = ?",
		user.Email,
	).Scan(&existingID)

	if err == nil {
		utils.SendError(w, http.StatusConflict, "Email already exists")
		return
	}

	if err != sql.ErrNoRows {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	_, err = database.DB.Exec(
		"INSERT INTO users(name, email,password)VALUES(?, ? , ?)",
		user.Name,
		user.Email,
		user.Password,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to register user")
		return
	}
	utils.SendSuccess(
		w,
		http.StatusCreated,
		"user registered successfully",
		nil,
	)

}

func Login(w http.ResponseWriter, r *http.Request) {

}
