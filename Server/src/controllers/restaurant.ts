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
 * @param body 
 * @returns object
 */
const PrepareDataForCreate = ( body:any ) => {
    let { restName, cuisine, long, lat } = body;
    let location = { type: "Point", coordinates: [long, lat] };

    let rest = { restName, cuisine, location, uniqueName: "" }
    rest.uniqueName = SetSlug(rest.restName)
    return rest;
}

/**
 * Description: creates a restaurant
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
 * Description: Creates several Restaurants
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
 * Description: search for the restaurant with the id supplied in the params
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
 * Description: search for restaurants with specific query
 * @param req 
 * @param res 
 * @param next 
 */
const SearchItems = (req: Request, res: Response, next: NextFunction) => {

    const query = req.query
    Restaurant.find(query)
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
 * Description:  get all documents
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
 * Description:  delete one restaurant with id supplied in params
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
 * Description: delete all documents
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