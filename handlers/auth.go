package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"taskflow-api/database"
	"taskflow-api/models"
	"taskflow-api/utils"
)

// Register godoc
// @Summary Register
// @Tags Authentication
// @Accept json
// @Produce json
// @Param user body models.RegisterRequest true "User"
// @Success 200 {string} string
// @Router /register [post]
func Register(w http.ResponseWriter, r *http.Request) {

	var register models.RegisterRequest

	err := json.NewDecoder(r.Body).Decode(&register)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	register = utils.SanitizeRegister(register)

	err = utils.ValidateRegister(register)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	hashedPassword, err := utils.HashPassword(register.Password)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	register.Password = hashedPassword

	var existingID int

	err = database.DB.QueryRow(
		"SELECT id FROM users WHERE email = ?",
		register.Email,
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
		"INSERT INTO users (name, email,password) VALUES(?, ? , ?)",
		register.Name,
		register.Email,
		register.Password,
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

// Login godoc
// @Summary Login user
// @Description Authentication user and return JWT token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param user body models.LoginRequest true "Login Request"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /login [post]
func Login(w http.ResponseWriter, r *http.Request) {

	var login models.LoginRequest

	err := json.NewDecoder(r.Body).Decode(&login)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	login = utils.SanitizeLogin(login)

	err = utils.ValidateLogin(login)

	if err != nil {
		utils.SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	var user models.User

	err = database.DB.QueryRow(
		"SELECT id, name , email , password, role FROM users WHERE email = ?",
		login.Email,
	).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
	)

	if err == sql.ErrNoRows {
		utils.SendError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Database error")
		return
	}

	if !utils.CheckPassword(login.Password, user.Password) {
		utils.SendError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, err := utils.GenerateJWT(
		user.ID,
		user.Role,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	utils.SendSuccess(
		w,
		http.StatusOK,
		"Login successfully",
		map[string]interface{}{
			"token": token,
			"user": map[string]interface{}{
				"id":    user.ID,
				"name":  user.Name,
				"email": user.Email,
				"role":  user.Role,
			},
		},
	)

}
