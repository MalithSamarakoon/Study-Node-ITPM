# StudyNode Backend

Spring Boot backend for StudyNode LMS.

## Tech Stack
- Java 17
- Spring Boot 3
- Spring Web, Spring Validation, Spring Data JPA
- MySQL
- Maven

## Run Locally
1. Create a MySQL database named `studynode`.
2. Configure environment variables (optional):
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `SERVER_PORT`
3. Run:

```bash
mvn spring-boot:run
```

Health endpoint:
- `GET /api/v1/health`

## TeamUp Base Endpoints
- `POST /api/v1/teams`
- `GET /api/v1/teams`
- `GET /api/v1/teams/{id}`
- `POST /api/v1/teams/{id}/join`
- `PUT /api/v1/teams/{id}/approve`
- `PUT /api/v1/teams/{id}/reject`
- `PUT /api/v1/teams/{id}/status`
- `GET /api/v1/teams/{id}/members`

## Notes
- Current implementation is a starter base for TeamUp and can be extended with auth/role guards and notification flows.
