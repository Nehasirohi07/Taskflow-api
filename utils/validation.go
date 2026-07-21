package utils

import (
	"errors"
	"net/mail"
	"strings"

	"taskflow-api/models"
)

func ValidateRegister(register models.RegisterRequest) error {

	if strings.TrimSpace(register.Name) == "" {
		return errors.New("Name is required")
	}

	if len(register.Name) < 3 {
		return errors.New("Name must be at least 3 characters")
	}

	if strings.TrimSpace(register.Email) == "" {
		return errors.New("Email is required")
	}

	_, err := mail.ParseAddress(register.Email)
	if err != nil {
		return errors.New("Invalid email format")
	}

	if strings.TrimSpace(register.Password) == "" {
		return errors.New("Password is required")
	}

	if len(register.Password) < 6 {
		return errors.New("Password must be atleast 6 characters")
	}

	return nil

}
