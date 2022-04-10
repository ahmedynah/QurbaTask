import express from "express";
import controller from "../controllers/user"



const router = express.Router();

// creates one user
router.post('/create/user', controller.CreateUser);

// creates many users
router.post("/insert/users", controller.InsertMany);

// delete all documents
router.delete('/del/all', controller.DeleteAll);

// delete one document after supplying the proper id as a parameter
router.delete("/del/:id", controller.DeleteOne);

// gets all documents
router.get('/get/all', controller.GetAllUsers);

/** search for all users for a specific Cuisine (e.g. Burgers) that have the following criteria:
    - User has Burgers as part of their Favorite Cuisines
    - User has a restaurant where the Cuisine is Burger
*/
router.get('/get/search/:cuisine', controller.GetAggregatedList);

// search for a user according to the req body input
router.get("/get/search", controller.SearchItems);

// get user with the id 
router.get("/get/:id", controller.GetUserById);

// update user with id
router.put("/update/:id", controller.UpdateOne);

export = router;