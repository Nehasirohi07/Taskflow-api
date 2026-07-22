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

func SanitizeProject(project models.ProjectRequest) models.ProjectRequest {

	project.Title = strings.TrimSpace(project.Title)
	project.Description = strings.TrimSpace(project.Description)
	project.Status = strings.TrimSpace(project.Status)
	project.Status = strings.ToLower(project.Status)

	return project
}

func SanitizeTask(task models.TaskRequest) models.TaskRequest {

	task.Title = strings.TrimSpace(task.Title)
	task.Description = strings.TrimSpace(task.Description)
	task.Status = strings.TrimSpace(task.Status)
	task.Status = strings.ToLower(task.Status)

	return task
}
