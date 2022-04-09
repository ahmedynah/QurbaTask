import { Schema } from "mongoose";

/**
 * mongoose schema for Point to be used to determine location of restaurants
 */
const PointSchema: Schema = new Schema({
    
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (cor: any) => {
         return cor[0] >= -180 && cor[0] <= 180 && cor[1] >= -90 && cor[1] <=90 && cor.length === 2 
        },
        message: (props:any) => `${props.value} is not in range, or single coordinate is supplied`
      } 
    }
  });


  export default PointSchema;