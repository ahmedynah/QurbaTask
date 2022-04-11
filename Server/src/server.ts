import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import logging from './config/logging';
import config from './config/config';
import mongoose from 'mongoose';
import restaurantRoutes from "./routes/restaurantRoutes";
import userRoutes from "./routes/userRoutes";
import fs from 'fs';
import swaggerUI from 'swagger-ui-express';

//to help indicate the place of the logging in the console
const NAMESPACE = 'Server';

const router = express();

// setting up Swagger
const swaggerFile: any = (process.cwd()+"/src/swagger/openapi.json");
const swaggerData: any = fs.readFileSync(swaggerFile, 'utf8');
const swaggerDocument = JSON.parse(swaggerData);

/** Connect to Mongo */
mongoose.connect(config.mongo.url, config.mongo.options)
.then( result =>{
    logging.info(NAMESPACE, "Connected to mongoDB");
})
.catch( error => {
    logging.error(NAMESPACE, error.message, error);
} );

/** Logging any request*/
router.use((req,res,next) => {
    logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.
        socket.remoteAddress}]`);
    res.on('finish', () => {
        logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.
            socket.remoteAddress}], STATUS - [${res.statusCode}]`);
            })
            next();
});


/** Swagger middleware */
router.use("/api-docs",swaggerUI.serve, swaggerUI.setup(swaggerDocument, null, null));

/** Parse the request */
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

/** Rules of API */
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if(req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
})

/** Source Routes */
router.use('/api/rest', restaurantRoutes);
router.use("/api/user", userRoutes)

/** Error Handling */
router.use((req, res, next) => {
    const err = new Error('not found');

    return res.status(404).json({
        message: err.message
    });
});

/** Create the server */
const httpServer = http.createServer(router);
httpServer.listen(config.server.port, () => logging.info(
    NAMESPACE, `Server running on ${config.server.hostname}:${config.server.port}`
))