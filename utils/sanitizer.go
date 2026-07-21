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
