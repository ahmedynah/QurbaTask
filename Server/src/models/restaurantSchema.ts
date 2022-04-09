import { Schema } from "mongoose";
import pointSchema from "./pointSchema";
import uniqueValidator from "mongoose-unique-validator";

// mongoose schema for restaurant
const RestaurantSchema: Schema = new Schema({
    restName: {type: String, required: true, lowercase: true},
    // uniqueName is to be used as a slug, and it is generated from restName
    uniqueName: {type: String, unique: true},
    cuisine: {type: String, required: true, lowercase: true},
    location: {type: pointSchema}
})

//this plugin forces the mongoose unique validator to be applied
RestaurantSchema.plugin(uniqueValidator);
export default  RestaurantSchema;