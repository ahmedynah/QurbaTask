// import { logging } from 'src/config/logging';
import {Response, Request, NextFunction} from 'express';
import logging from '../config/logging';

const NAMESPACE = 'Sample Controller';

const getAllRestaurants = (req: Request, res: Response, next: NextFunction) => {

    logging.info(NAMESPACE, `Sample health check route called.`);

    return res.status(200).json({
        message: 'pong'
    });
};

export default { getAllRestaurants };