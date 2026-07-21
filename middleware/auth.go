package middleware

import (
	"context"
	"net/http"
	"strings"
	"taskflow-api/utils"
)

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			http.Error(w, "Authorization token required", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer")
		tokenString = strings.TrimSpace(tokenString)

		claims, err := utils.ValidateJWT(tokenString)
		if err != nil {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(
			r.Context(),
			"userID",
			claims.UserID,
		)
		ctx = context.WithValue(
			ctx,
			"role",
			claims.Role,
		)

		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
