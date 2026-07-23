package models

type Dashboard struct {
	TotalProjects   int `json:"totalprojects"`
	TotalTasks      int `json:"totaltasks"`
	CompletedTasks  int `json:"completetasks"`
	PendingTasks    int `json:"pendingtasks"`
	InProgressTasks int `json:"inprogresstasks"`
}
