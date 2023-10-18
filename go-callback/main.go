package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/monitor"
)

const secretKey = "kjadskjaskdjaf"

func verifyCallbackSignature(message []byte, providedSignature, secretKey string) bool {
	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write(message)
	computedSignature := hex.EncodeToString(h.Sum(nil))

	// Use crypto/subtle.ConstantTimeCompare to prevent timing attacks
	signaturesMatch := subtle.ConstantTimeCompare([]byte(computedSignature), []byte(providedSignature)) == 1

	return signaturesMatch
}

func main() {

	app := fiber.New(fiber.Config{})
	// validator.RegisterCustomValidator()

	app.Use(cors.New())

	// Initialize default config (Assign the middleware to /metrics)
	app.Get("/metrics", monitor.New())

	// Health check
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendStatus(200)
	})

	app.Post("/aegis-webhook", func(c *fiber.Ctx) error {
		callbackId := c.Get("x-aegis-callback-id")
		signature := c.Get("x-aegis-signature")

		body := c.Body()
		fmt.Printf("Body: %s\nCallbackId: %s\nSignature: %s", body, callbackId, signature)

		// You should implement the `verifyCallbackSignature` and `secretKey` logic here
		verifySuccess := verifyCallbackSignature(body, signature, secretKey)
		fmt.Println("verifySuccess", verifySuccess)
		if verifySuccess {
			return c.SendString("Success")
		}

		return c.Status(fiber.StatusUnauthorized).SendString("")
	})

	app.Listen(":" + strconv.Itoa(3015))
}

// package main

// import (
// 	"aegis-custody/src/eth"
// 	"aegis-custody/src/hsm"
// 	"log"
// )

// func main() {

// 	//InitPKCS11 initializes the PKCS11 library.
// 	err := hsm.InitPKCS11("/usr/local/lib/softhsm/libsofthsm2.so", "khiemne")
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	eth.ConnectSepolia()
// 	// eth.TransferNativeETH("1", "0x6e7F4b109613fa71537e3eE5835C494a17E003d8", big.NewInt(1000000))
// 	// eth.TransferERC20Token("1", "0xe1314332Ec5A4cf637DE752B8CF6972D37E92348", "0x6e7F4b109613fa71537e3eE5835C494a17E003d8", big.NewInt(10))
// 	eth.GetBalanceERC20("1", "0xe1314332Ec5A4cf637DE752B8CF6972D37E92348")
// }

// package main

// import (
// 	"aegis-custody/src/btc"
// 	"fmt"
// )

// func main() {
// 	rawTx, err := btc.CreateTx("91izeJtyQ1DNGkiRtMGRKBEKYQTX46Ug8mGtKWpX9mDKqArsLpH",
// 		"mkYvnmm3KUBkvVqUAYsG6A6amt5Dva4jzX", 60000)

// 	if err != nil {
// 		fmt.Println(err)
// 	}

// 	fmt.Println("raw signed transaction is: ", rawTx)
// }
