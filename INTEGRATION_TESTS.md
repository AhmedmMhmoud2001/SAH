# SAH Academy - Integration Tests

## Test 1: Health Check
GET http://localhost:3000/api/health

## Test 2: List Courses
GET http://localhost:3000/api/courses

## Test 3: Register New User
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "testnew@example.com",
  "password": "test123456"
}

## Test 4: Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "rana@test.com",
  "password": "123456"
}

## Test 5: Get Current User (with token)
GET http://localhost:3000/api/auth/me
Authorization: Bearer <token>

## Test 6: Enroll in Course
POST http://localhost:3000/api/enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "<course-id>"
}

## Test 7: Get Enrollments
GET http://localhost:3000/api/enrollments
Authorization: Bearer <token>

## Test 8: Get Course Lessons
GET http://localhost:3000/api/courses/<course-id>/lessons

## Test 9: Mark Lesson Complete
POST http://localhost:3000/api/progress/<course-id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "lessonId": "<lesson-id>",
  "completed": true
}

## Test 10: Get Quiz
GET http://localhost:3000/api/quizzes/<quiz-id>

## Test 11: Submit Quiz
POST http://localhost:3000/api/quizzes/<quiz-id>/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [1, 0, 1, 1]
}