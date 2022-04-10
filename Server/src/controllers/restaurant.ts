import { Response, Request, NextFunction } from 'express';
import logging from '../config/logging';
import mongoose from 'mongoose';
import RestaurantSchema from "../models/restaurantSchema"


const NAMESPACE = 'Restaurant Controller';
const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

/**
 * Description: this function generates the slug from the restName
 * @param restName 
 * @returns string
 */
const SetSlug = (restName: string) => {
    let temp = restName?.trim().toLowerCase() + " 0";
    return temp?.replace(/\s/g, '-');
}

/**
 * Description: this function prepare an object with the right data to be used
 * @param body: any
 * @returns rest: object
 */
const PrepareDataForCreate = ( body:any ) => {
    let { restName, cuisine, long, lat } = body;
    let location = { type: "Point", coordinates: [long, lat] };

    let rest = { restName, cuisine, location, uniqueName: "" }
    rest.uniqueName = SetSlug(rest.restName)
    return rest;
}

/**
 * Description: Creates one restaurant
 * 
 * example:
 * --------
 * localhost:8080/api/rest/create/rest
 * req.body =

             {

                      "restName": "pizza queen",
                      "cuisine": "pizza",
                      "long": -60.23689,
                      "lat": 20.62739

              } 
          
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const CreateRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    console.log({...req.body})
    const data = { ...PrepareDataForCreate(req.body) }
    console.log({...data})
    const rest = new Restaurant({
        ...data
    });
    return rest.save()
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
 * Description: Inserts Many restaurants into db
 * example:
 * --------
 * localhost:8080/api/rest/insert/rests
 * req.body =
                {
                     "data" :
                               [        
                                     {
                                    
                                         "restName": "pizza queen",
                                         "cuisine": "pizza",
                                         "long": -60.23689,
                                         "lat": 20.62739
                                    
                                     },               


                                 {
                                     "restName": "pizza station",
                                     "cuisine": "pizza",
                                     "long": -60.23689,
                                     "lat": 20.62739
                                 }
                         ]
                }
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const InsertMany = (req: Request, res: Response, next: NextFunction) => {
    let data: any[] = []
    for(let d in req.body.data){
        console.log(req.body.data[d]);
        data.push(PrepareDataForCreate(req.body.data[d]));
    }

    Restaurant.insertMany([...data])
    .then(results => {
        return res.status(200).json({
            rests: results,
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
 * Description: gets specific restaurant by id
 * 
 * example:
 * ---------
 * localhost:8080/api/rest/get/62507873cdd7f93668f1a199
 * req.params.id = 62507873cdd7f93668f1a199
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const GetRestaurantById = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    Restaurant.findById(id)
        .then(results => {
            return res.status(200).json({
                restaurants: results,
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
}

/**
 * Description: search for restaurant with the slug supplied in the params
 * example:
 * --------
 * localhost:8080/api/rest/get/holmes-0
 * req.params.slug = pizza-queen
 * @param req 
 * @param res 
 * @param next 
 */
const GetRestaurantBySlug = (req: Request, res: Response, next: NextFunction) => {
    const slug = req.params.slug;
    Restaurant.findOne({ uniqueName: slug })
        .then(results => {
            if (results.length !== 0)
                return res.status(200).json({
                    restaurants: results,
                    count: results.length
                })
            else
                next()
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
 * Description: searches for a restaurant with tha specific body
 * 
 * example:
 * ---------
 * localhost:8080/api/rest/get/search
   req.body = 
            {
               "restName": "holmes"
              }
 * @param req 
 * @param res 
 * @param next 
 */
const SearchItems = (req: Request, res: Response, next: NextFunction) => {

    const body = req.body
    Restaurant.find(body)
        .exec()
        .then(results => {
            return res.status(200).json({
                restaurants: results,
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
 * Description: gets all restaurant 
 * example:
 * ---------
 * localhost:8080/api/rest/get/all
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const GetAllRestaurants = (req: Request, res: Response, next: NextFunction) => {
    Restaurant.find()
        .exec()
        .then(results => {
            return res.status(200).json({
                restaurants: results,
                count: results.length
            });
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
 * Description: search for all restaurant in 1 km distance from the restaurant with the id supplied in params
 * example:
 * --------
 * localhost:8080/api/rest/get/search1km/62507873cdd7f93668f1a199
 * @param req 
 * @param res 
 * @param next 
 */
const GetRestsIn1Km = async (req: Request, res: Response, next: NextFunction) => {
    const rest = await Restaurant.findById(req.params.id)
    const cor = rest.location.coordinates;
    
    //if using mongodb is a must
    const restMongo = await Restaurant.find({ location: { $geoWithin: { $center: [cor, 1] } } })

    //using mongoose geoSpatial
    Restaurant.find().where('location').within(
        // radius: gets data in radians so 1km = 0.1570 radians
        { center: cor, radius: 0.1570, unique: true, spherical: true }
    ).exec()
        .then((results: any) => {
            return res.status(201).json({
                restsUsingMongoose: results,
                countMongoose: results.length,
                restsUsingMongo: restMongo,
                countMongo: restMongo.length
            });
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
 * Description: updates one restaurant
 * 
 * example:
 * ---------
 * localhost:8080/api/rest/update/6250ee8e727fe7d0f853593b
 *  req.params.id = 6250ee8e727fe7d0f853593b
 *  req.body = 
             {
               "restName": "Hell's Kitchen"
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
        if (key === "restName") {
            doc.uniqueName = SetSlug(req.body[key])
        }
    }
    Restaurant.findOneAndUpdate({ _id }, { ...doc }, { returnDocument: 'after', overwrite: false, runValidators: true, context: 'query' })
        .then((result: any) => {
            return res.status(201).json({
                restaurants: result
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
 * Description: deletes one restaurant
 * 
 * example:
 * ---------
 * localhost:8080/api/rest/del/6250ee1c727fe7d0f8535935
 * req.params.id = 6250ee8e727fe7d0f853593b
 *  
 * @param req 
 * @param res 
 * @param next 
 */
const DeleteOne = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    Restaurant.findByIdAndDelete(id)
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
 * Description: deletes all restaurants
 * 
 * example:
 * ---------
 * localhost:8080/api/rest/del/all
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const DeleteAll = (req: Request, res: Response, next: NextFunction) => {
    Restaurant.deleteMany()
        .exec()
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

export default {
    InsertMany,
    CreateRestaurant,
    UpdateOne,
    DeleteOne,
    DeleteAll,
    GetRestaurantBySlug,
    GetRestaurantById,
    SearchItems,
    GetAllRestaurants,
    GetRestsIn1Km,
    SetSlug
};