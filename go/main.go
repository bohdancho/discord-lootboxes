package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		panic(err)
	}
	headers := map[string]string{
		"AUTHORIZATION":      os.Getenv("AUTHORIZATION"),
		"X_SUPER_PROPERTIES": os.Getenv("X_SUPER_PROPERTIES"),
	}

	var lastOK time.Time
	minOkInterval := time.Duration(0)
	successes := 0
	for {
		req, _ := http.NewRequest("POST", "https://discord.com/api/v9/users/@me/lootboxes/open", nil)
		for key, val := range headers {
			req.Header.Add(key, val)
		}

		client := &http.Client{}
		res, _ := client.Do(req)

		okInterval := time.Since(lastOK)
		if res.StatusCode == http.StatusOK {
			if successes > 1 {
				if okInterval < minOkInterval || minOkInterval == 0 {
					minOkInterval = okInterval
				}
			}
			lastOK = time.Now()
			successes++

		}
		fmt.Printf("response: %d, interval: %v, minOkInterval: %v\n", res.StatusCode, okInterval, minOkInterval)

		time.Sleep(minOkInterval)
	}
}
