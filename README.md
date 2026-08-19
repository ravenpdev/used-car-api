# Used Car Pricing API

**REQUIREMENTS**

- node
- pnpm
- docker

**Commands**

- _docker compose up -d_ -> run all postgres container
- _docker compose up -d db-test_ -> run postgres container for testing
- _docker compose exec container_name psql -U db_username -d database_name_ if you don't like using database gui

**FEATURES**

- Users sign up with email/password
- Users get an estimate for how much their car is worth based on the make/model/year/mileage
- Users can report what they sold their vehicles for
- Admins have to approve reported sales

**Routes**

- POST /auth/signup -> Body {email, password} -> Create a new user and sign in
- POST /auth/signin -> Body {email, password} -> Sign in as an existing user
- GET /users -> return all users
- POST /users -> Body {email, password, confirmPassword} -> Create a new user
- GET /users/:id -> return a user
- PATCH /users/:id -> Partial<{email, password}> -> Update user
- DELETE /users/:id -> Delete user
- GET /reports -> Query String make,model,year,mileage,longitude,latitude -> Get an estimate for the cars value
- POST /reports -> Body {make, model, year, mileage, longitude, latitude, price} -> Report how much a vehicle sold for
- PATCH /reports -> Body { approved } -> Approved or reject a report submitted by a user

**TODOS**

- [✅] signin route

- [✅] signup route

- [✅] unit test auth.controller

- [✅] unit test auth.service

- [✅] e2e test auth

- [ ] e2e test users

- [ ] get report route

- [ ] post report route

- [ ] ptach report route
