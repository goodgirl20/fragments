# POST without authentication should fail
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

`Unauthenticated fragment`

HTTP/1.1 401