# Lab 9: Verify fragment data is stored, read, and deleted using S3

# 1. Create a text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello S3!`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"

[Captures]
url: header "Location"


# 2. Retrieve the fragment
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" startsWith "text/plain"
body == "Hello S3!"


# 3. Delete the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"


# 4. Confirm the deleted fragment cannot be retrieved
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"