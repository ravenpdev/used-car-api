# Used Car Pricing API

**FEATURES**

- Users sign up with email/password
- Users get an estimate for how much their car is worth based on the make/model/year/mileage
- Users can report what they sold their vehicles for
- Admins have to approve reported sales

**Routes**

- POST /auth/signup -> Body {email, password} -> Create a new user and sign in
- POST /auth/signin -> Body {email, password} -> Sign in as an existing user
- GET /reports -> Query String make,model,year,mileage,longitude,latitude -> Get an estimate for the cars value
- POST /reports -> Body {make, model, year, mileage, longitude, latitude, price} -> Report how much a vehicle sold for
- PATCH /reports -> Body { approved } -> Approved or reject a report submitted by a user

**TODOS**

- [✔️] signin route

- [✔️] signup route

- [ ] get report route

- [ ] post report route

- [ ] ptach report route
