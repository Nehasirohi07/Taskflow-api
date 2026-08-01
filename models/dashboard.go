package models

type Dashboard struct {
	TotalProjects  int `json:"total_projects"`
	TotalTasks     int `json:"total_tasks"`
	CompletedTasks int `json:"completed_tasks"`
	ActiveTasks    int `json:"active_tasks"`
	ArchivedTasks  int `json:"archived_tasks"`
}
