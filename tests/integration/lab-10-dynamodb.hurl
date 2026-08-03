# Lab 10: DynamoDB metadata integration test
# Tests fragment metadata in DynamoDB and fragment data in S3.

# ------------------------------------------------------------
# 1. Create the first fragment as JSON
# ------------------------------------------------------------

POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "service": "DynamoDB"
}

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" isString
jsonpath "$.fragment.ownerId" == "user1@email.com"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" > 0
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"

[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"


# ------------------------------------------------------------
# 2. Get the first fragment's metadata
# ------------------------------------------------------------

GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.ownerId" == "user1@email.com"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" > 0


# ------------------------------------------------------------
# 3. Create the second fragment as Markdown
# ------------------------------------------------------------

POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**.`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" isString
jsonpath "$.fragment.ownerId" == "user1@email.com"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" > 0
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"

[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"


# ------------------------------------------------------------
# 4. Get the second fragment's metadata
# ------------------------------------------------------------

GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.ownerId" == "user1@email.com"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" > 0


# ------------------------------------------------------------
# 5. List fragment IDs and confirm both exist
# ------------------------------------------------------------

GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isList
jsonpath "$.fragments" contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"


# ------------------------------------------------------------
# 6. Delete only the first fragment
# ------------------------------------------------------------

DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"


# ------------------------------------------------------------
# 7. Confirm the first fragment was deleted
# ------------------------------------------------------------

GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404


# ------------------------------------------------------------
# 8. List fragments again
# Confirm the first ID is gone and the second still exists
# ------------------------------------------------------------

GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isList
jsonpath "$.fragments" not contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"
