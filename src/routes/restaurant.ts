import  express  from "express";
import controller from "../controllers/restaurant"

const router = express.Router();

router.get('/get/restaurants', controller.getAllRestaurants);

export = router;