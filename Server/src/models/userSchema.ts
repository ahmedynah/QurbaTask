import mongoose, { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

// mongoose schema for user
const UserSchema: Schema = new Schema({
    fullName: {
        firstName: { type: String,
                     required: true, 
                     lowercase: true, 
                     trim: true,
                     validate:{
                         // to make sure that name has only letters
                         validator: function hasNumber(input: any) {
                            return !(/\d/.test(input));
                          },
                          message: (props: any) => `${props.value} contains a number`
                          
                     } },
        lastName: { type: String, 
                    required: true, 
                    lowercase: true, 
                    trim: true, 
                    validate:{
                        // to make sure that name has only letters
                        validator: function hasNumber(input: any) {
                           return !(/\d/.test(input));
                         },
                         message: (props: any) => `${props.value} contains a number`
                         
                    } }
                
    },
    // user can have many favorite cuisines
    favCuisines: [{
        type: String,
        required: true,
        lowercase: true,
        validate: {
            validator: (arr: any) => {
                for (let item in arr) {
                    let temp = item.toLowerCase();
                    if (temp !== item)
                        return false;
                }
                return true;
            },
            message: (props: any) => `${props.value} not all lowercase`
        }
    }],
    // one user can manage zero or more restaurants
    managedRests: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Restaurant",
        dropDups: true,
    }]
})

// this plugin to force mongoose unique validator
UserSchema.plugin(uniqueValidator);
export default UserSchema;