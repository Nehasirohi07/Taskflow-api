package models

import "time"

type AdminDashboard struct {
	TotalUsers    int `json:"total_users"`
	TotalProjects int `json:"total_projects"`
	TotalTasks    int `json:"total_tasks"`
}

type AdminUser struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}
