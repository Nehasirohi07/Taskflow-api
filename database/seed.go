package database

import (
	"database/sql"
	"log"
)

func CreateDefaultAdmin() {

	var id int

	err := DB.QueryRow(
		`SELECT id FROM users WHERE email = ?`,
		"nehasirohi33@gmail.com",
	).Scan(&id)

	if err == sql.ErrNoRows {
		log.Println("❌ User not found")
		return
	}

	if err != nil {
		log.Println("❌ Database error:", err)
		return
	}

	_, err = DB.Exec(
		`UPDATE users
		 SET role = 'admin'
		 WHERE email = ?`,
		"nehasirohi33@gmail.com",
	)

	if err != nil {
		log.Println("❌ Failed to promote user to admin:", err)
		return
	}

	log.Println("✅ User promoted to admin successfully")
}
