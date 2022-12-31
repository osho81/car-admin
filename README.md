## Admin-web for backend car-rental-v2 project 

### Intro on overall car rental project 
car-rental-v2 is mainly a rest api project built on Java/SpringBoot. This admin-web is a website for registered administrators to retrieve, display and edit data from the car-rental-v2 rest api endpoints and its conncted database. 

#### The projects can be found here: 
-  [car-rental-v2 (backend, rest api, database)](https://gitlab.com/car-rental-fullstack/car-rental-v2)
-  [admin-web (this frontend js project)](https://gitlab.com/car-rental-fullstack/admin-web)
-  [customer-web (corresponding webpage for customers)](https://gitlab.com/car-rental-fullstack/customer-web)

##### Corporate styleguide used for these projects:
-  [TW Styleguide](https://gitlab.com/car-rental-fullstack/tw-styleguide)

### Description of related rest api project
The backend project car-rental-v2 provides api for the following requests alloweed for ADMINS:
- List customers; GET /api/v1/customers
- Add a rental car; POST /api/v1/addcar
- Delete a rental car; DELETE /api/v1/deletecar
- Update a rental car; PUT /api/v1/updatecar
- Cancel order; PUT /api/v1/cancelorder

#### Functions in admin-web 
The admin-web allows the signed in admin to retrieve records from the database, via the rest api. Admin can thus by click fucntions display a list of cars, list of customers, view a customer's orders, and sort and filter records alphabetically or by numbers. The admin can also add, update or delete a car. 

### Login and security 
For login and access management, [Keycloak (Quarkus distribution)](https://www.keycloak.org/downloads) is employed. For the frontend, i.e. this admin-web, a Javascript adapter form the same source have been included in the project. Brief configuration description: 
- Realm name: car-rental-realm
- Client id: car-rental-v2
- Valid post logout redirect URIs: 
    - http://localhost:9090/api/v1/* 
    - http://127.0.0.1:5500/* 
    - http://127.0.0.1:5501/*
    - During development * as uri and web origin uri is sufficient. 
- Roles: admin & user

Authorization is validated using keycloak Bearer access token in the http requests. 
    - Users with assigned "admin" role can access the endpoints described above for admins/employees.
    - Users with assigned "user" role can access the endpoints described above for the customers.

### Tech used for admin-web
- Javascript
- JavaScript Fetch API
- jQuery
- Bootstrap 5
- HTML/CSS
- Keycloak access management, JS client adapter 
(For car-rental-v2 backend; Java, SpringBoot, Keycloak, Spring Security, SQl, H2 database)

### Purpose/Motivation
The overall purpose of the fullstack car rental project is to improve rest api skills, practising on database management, learn how to build http requests, as well as to improve skills in Springboot, security implementation, and microservice architecture. This frontend part is mainly to improve CSS/HTML, Javascript with jQuery, Fetch api, and bootstrap. 