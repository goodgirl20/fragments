# Confirm that posting a JSON fragment works
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "course": "CCP555",
  "lab": 8,
  "message": "JSON fragment test"
}

HTTP/1.1 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" isString
jsonpath "$.fragment.ownerId" == "user1@email.com"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" > 0

[Captures]
url: header "Location"


# GET the same JSON fragment
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" matches "^application\/json"
jsonpath "$.course" == "CCP555"
jsonpath "$.lab" == 8
jsonpath "$.message" == "JSON fragment test"