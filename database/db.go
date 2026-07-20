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

		"%s:%s@tcp(%s:%s)/%s?ParseTime=true",

		dbUser,
		dbPassword,
		dbHost,
		dbPort,
		dbName,
	)

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

		time.Sleep(3 * time.Second)

	}

	log.Fatal("could not connect to database after 10 retries")

}
