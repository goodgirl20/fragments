# Assignment 3: Create, update, and retrieve a fragment

# 1. Create fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Original Hurl content`

HTTP 201

[Asserts]
jsonpath "$.status" == "ok"

[Captures]
fragmentUrl: header "Location"


# 2. Update fragment
PUT {{fragmentUrl}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Updated Hurl content`

HTTP 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"


# 3. Verify updated content
GET {{fragmentUrl}}
[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" startsWith "text/plain"
body == "Updated Hurl content"