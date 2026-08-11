# Assignment 3: Image POST and PNG -> JPEG conversion

# 1. Create a PNG fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
user1@email.com:password1
file,test-image.png;

HTTP 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "image/png"

[Captures]
fragmentId: jsonpath "$.fragment.id"


# 2. Convert PNG fragment to JPEG
GET http://localhost:8080/v1/fragments/{{fragmentId}}.jpg
[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" startsWith "image/jpeg"


# 3. Delete the test fragment
DELETE http://localhost:8080/v1/fragments/{{fragmentId}}
[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
jsonpath "$.status" == "ok"