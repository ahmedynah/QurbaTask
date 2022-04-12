# QurbaTask
Restaurant API

# Important Notes #
- - - - -
1. ### .env ###
      1. *Please, create a .env file and create the following example:*
             1. #### SERVER_HOSTNAME = "localhost" ####
             2. #### SERVER_PORT=8080 #### 
     - *online mongodb credentials:*
             1. #### DB_CONN_STRING= ####
             2. #### DB_NAME= ####
             3. #### MONGO_USERNAME = ####
             5. #### MONGO_PASSWORD = ####
             6. #### MONGO_URL = ####

2. ### NOTICE: Online mongo db is used, so you need to create a mongo database
    1. * follow the [link](https://www.mongodb.com/basics/create-database) to create an online mongo db *

3. ### You can test the end points using SwaggerUI

# Images #
- - - - -

![figure 1](https://github.com/ahmedynah/QurbaTask/blob/master/images/Screenshot%20(249).png)
- In figure 1, local development and port 8080 are selected
  and we choose to make the baseURL = /api/rest or /api/user from the dropdown meanu ( where the arrow points )
- Some of the restaurant endpoints are shown
![figure 2](https://github.com/ahmedynah/QurbaTask/blob/master/images/Screenshot%20(250).png)
- Some of the user endpoints are shown
![figure 3](https://github.com/ahmedynah/QurbaTask/blob/master/images/Screenshot%20(251).png)
- Excuted /api/rest/get/all request to fetch all restaurants in database
![figure 4](https://github.com/ahmedynah/QurbaTask/blob/master/images/Screenshot%20(252).png)
- Excuted /api/user/get/all request to fetch all users in database

