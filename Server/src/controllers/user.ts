import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";
import logging from "../config/logging";
import UserSchema from "../models/userSchema";

const NAMESPACE = "User Controller"
var User = mongoose.model("User", UserSchema);

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


const SearchItems = (req: Request, res: Response, next: NextFunction) => {

    const query = req.query
    User.find(query)
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

const InsertMany = (req: Request, res: Response, next: NextFunction) => {
    User.insertMany([...req.body])
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

const GetAggregatedList = (req: Request, res: Response, next: NextFunction) => {
  const data = User.aggregate([
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
        }
    ])
    // console.log(data)
    .then((results: any) => {
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