import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";
import logging from "../config/logging";
import UserSchema from "../models/userSchema";

const NAMESPACE = "User Controller"
var User = mongoose.model("User", UserSchema);


/**
 * Description: Creates one user
 * 
 * example:
 * --------
 * localhost:8080/api/user/create/user
 * req.body =

             {
                  "fullName": {
                              "firstName": "mohab",
                              "lastName": "hany"
                          },
                  "favCuisines": [
                              "Pizza"
                          ],
                  "managedRests": [
                      "624fecd3e88b5fcf98429089"
                  ]
              } 
 *  
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const CreateUser = (req: Request, res: Response, next: NextFunction) => {
    const user: any = new User({
        ...req.body
    })
    
    return user.save()
        .then((result: any) => {
            return res.status(201).json({
                data: result
            });
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, error.message, error);
            return res.status(500).json({
                message: error.message,
                error
            })
        });
}

/**
 * Description: gets specific user by id
 * 
 * example:
 * ---------
 * localhost:8080/api/user/get/624fecd3e88b5fcf98429089
 * 
 * req.params.id = 624fecd3e88b5fcf98429089
 * 
 * @param req 
 * @param res 
 * @param next 
 */

const GetUserById = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    User.findById(id)
        .then((results: any) => {
            return res.status(200).json({
                users: results,
                count: results.length
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: error.message,
                error
            })
        })
}

/**
 * Description: searches for a user with tha specific body
 * 
 * example:
 * ---------
 * localhost:8080/api/user/get/search
 * 
 *  req.body = 
             {
                "fullName": {
                   "firstName": "ahmed",
                   "lastName": "hany"
                   }
               }
 * @param req 
 * @param res 
 * @param next 
 */

const SearchItems = (req: Request, res: Response, next: NextFunction) => {

    const body = req.body
    User.find(body)
        .exec()
        .then(results => {
            return res.status(200).json({
                users: results,
                count: results.length
            })
        })
        .catch(error => {
            logging.error(NAMESPACE, error.message, error);
            return res.status(500).json({
                message: error.message,
                error
            });
        })
};

/**
 * Description: gets all user 
 * example:
 * ---------
 * localhost:8080/api/user/get/all
 * 
 * @param req 
 * @param res 
 * @param next 
 */

const GetAllUsers = (req: Request, res: Response, next: NextFunction) => {

    User.find().populate('managedRests')
        .exec()
        .then(results => {
            return res.status(200).json({
                users: results,
                count: results.length
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: error.message,
                error
            })
        })
}

/**
 * Description: Inserts Many users into db
 * example:
 * --------
 * localhost:8080/api/user/insert/users
 * 
 * req.body =
 {
      "data" : 
                   [        
          {
                    "fullName": {
                        "firstName": "ahmed",
                        "lastName": "hany"
                    },
                    "favCuisines": [
                        "Burger",
                        "Pizza"
                    ],
                    "managedRests": ["624fecd3e88b5fcf98429089", "62507853cdd7f93668f1a193"]
                    },               
                        
                {
                    "fullName": {
                        "firstName": "mohab",
                        "lastName": "hany"
                    },
                    "favCuisines": [
                        "Pizza"
                    ],
                    "managedRests": []
                }
            ]
  }
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const InsertMany = (req: Request, res: Response, next: NextFunction) => {
    User.insertMany([...req.body.data])
    .then(results => {
        return res.status(200).json({
            users: results,
            count: results.length
        });
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message,
            error
        })
    })
}

/**
 * Description: search for all users for a specific Cuisine (e.g. Burgers) that have the following criteria:
                    - User has Burgers as part of their Favorite Cuisines
                    - User has a restaurant where the Cuisine is Burger
   example:
   --------
   localhost:8080/api/user/get/search/burger
   req.params.cuisine = burger

 * @param req 
 * @param res 
 * @param next 
 */

const GetAggregatedList = async (req: Request, res: Response, next: NextFunction) => {
  const data =  User.aggregate([
        {
            $match: { favCuisines: req.params.cuisine }
        },
        {
            $lookup:
            {
                from: "restaurants",
                localField: "managedRests",
                foreignField: "_id",
                as: "restaurant_info"
            }
        },{
            $match: {"restaurant_info.cuisine": req.params.cuisine }
        }
    ]) 
    .then(async (results: any) => {
        return res.status(200).json({
            users: results,
            count: results.length
        });
    })
    .catch((error: any )=> {
        return res.status(500).json({
            message: error.message,
            error
        })
    })
}

/**
 * Description: updates one user
 * 
 * example:
 * ---------
 * localhost:8080/api/user/update/6250ee8e727fe7d0f853593b
 * 
 *  req.params.id = 6250ee8e727fe7d0f853593b
 *  req.body = 
                 {
                   "fullName": {
                      "firstName": "ahmed",
                      "lastName": "hany"
                      }
                  }
 * @param req 
 * @param res 
 * @param next 
 */


const UpdateOne = (req: Request, res: Response, next: NextFunction) => {
    const _id = req.params.id;
    let doc: any = {};
    for (let key in req.body) {
        doc[key] = req.body[key]
    }
    
    User.findOneAndUpdate({ _id }, { ...doc }, { returnDocument: 'after', overwrite: false, runValidators: true, context: 'query' })
        .then((result: any) => {
            return res.status(201).json({
                users: result
            })
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, error.message, error);
            return res.status(500).json({
                message: error.message,
                error
            })
        })
}

/**
 * Description: deletes one user
 * 
 * example:
 * ---------
 * localhost:8080/api/user/del/6250ee1c727fe7d0f8535935
 * 
 * req.params.id = 6250ee8e727fe7d0f853593b
 *  
 * @param req 
 * @param res 
 * @param next 
 */

const DeleteOne = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    User.findByIdAndDelete(id)
        .then(results => {
            return res.status(200).json({
                data: results,
            });
        })
        .catch(error => {
            logging.error(NAMESPACE, error.message, error);
            return res.status(500).json({
                message: error.message,
                error
            });
        })
}

/**
 * Description: deletes all users
 * 
 * example:
 * ---------
 * localhost:8080/api/user/del/all
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const DeleteAll = (req: Request, res: Response, next: NextFunction) => {
    User.deleteMany()
        .exec()
        .then(results => {
            return res.status(200).json({
                data: results,
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: error.message,
                error
            });
        })
}

export default {
    GetAggregatedList,
    DeleteAll,
    GetAllUsers,
    CreateUser,
    GetUserById,
    SearchItems,
    UpdateOne,
    DeleteOne,
    InsertMany
}