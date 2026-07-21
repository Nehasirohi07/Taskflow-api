package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() {

	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf(

		"%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4&loc=Local",

		dbUser,
		dbPassword,
		dbHost,
		dbPort,
		dbName,
	)
	fmt.Println("DB User :", dbUser)
	fmt.Println("DB Password :", dbPassword)
	fmt.Println("DB Host :", dbHost)
	fmt.Println("DB Port :", dbPort)
	fmt.Println("DB Name :", dbName)
	fmt.Println("DSN :", dsn)

	db, err := sql.Open("mysql", dsn)

	if err != nil {
		log.Fatal(err)
	}

	DB = db

	for i := 1; i <= 10; i++ {

		err = DB.Ping()

		if err == nil {
			fmt.Println("✅Database connected successfully!")
			return
		}
		fmt.Printf("Database not ready... Retry %d/10\n", i)
		fmt.Println("Error:", err)

		time.Sleep(3 * time.Second)

	}

	log.Fatal("could not connect to database after 10 retries")

}
