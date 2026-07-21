package middleware

import (
	"log"
	"net/http"
	"time"
)

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(StatusCode int) {
	rw.statusCode = StatusCode
	rw.ResponseWriter.WriteHeader(StatusCode)
}

func Logger(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		start := time.Now()

		rw := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(rw, r)

		duration := time.Since(start)

		log.Printf(
			"Method: %s | Path: %s | Status: %d | Duration: %v",
			r.Method,
			r.URL.Path,
			rw.statusCode,
			duration,
		)
	})
}
