# Unsupported content type should fail
POST http://localhost:8080/v1/fragments
Content-Type: application/pdf
[BasicAuth]
user1@email.com:password1

`fake pdf content`

HTTP/1.1 415