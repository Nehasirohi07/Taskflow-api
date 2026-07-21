package utils

import (
	"strings"
	"taskflow-api/models"
)

func SanitizeRegister(register models.RegisterRequest) models.RegisterRequest {

	register.Name = strings.TrimSpace(register.Name)
	register.Email = strings.TrimSpace(register.Email)
	register.Email = strings.ToLower(register.Email)
	register.Password = strings.TrimSpace(register.Password)

	return register

}

func SanitizeLogin(login models.LoginRequest) models.LoginRequest {

	login.Email = strings.TrimSpace(login.Email)
	login.Email = strings.ToLower(login.Email)
	login.Password = strings.TrimSpace(login.Password)

	return login
}
