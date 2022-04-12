import  express  from "express";
import controller from "../controllers/restaurant"


        
        

const router = express.Router();

// create one restaurant with data from body
router.post("/create/rest", controller.CreateRestaurant);

// insert many restaurants with data from body
router.post("/insert/rests", controller.InsertMany);

// get all documents
router.get("/get/all", controller.GetAllRestaurants);

// delete all documents
router.delete("/del/all", controller.DeleteAll);

// delete one restaurant with id supplied in params
router.delete("/del/:id", controller.DeleteOne);

// search for restaurants with specific properties in req.body body
router.post("/search/rest", controller.SearchItems);

// search for all restaurant in 1 km distance from
// the restaurant with the id supplied in params
router.get("/get/rest/search1km/:id", controller.GetRestsIn1Km);

// search for restaurant with the slug supplied in the params
router.get("/get/rest/:slug", controller.GetRestaurantBySlug);

//search for the restaurant with the id supplied in the params
router.get("/get/rest/:id", controller.GetRestaurantById);

// update the restaurant with the id supplied in the params
router.put("/update/rest/:id", controller.UpdateOne);

export = router;