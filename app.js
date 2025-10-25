import 'express-async-errors'
import express from 'express';
import dotenv from 'dotenv';
import {createServer}  from 'http';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import cors from 'cors';
import connectDB from './config/connect.js';
import authRouter from './routes/auth.js';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import notFoundMiddleware from './middleware/not-found.js'
import errorHandlerMiddleware from './middleware/error-handler.js'
import { home } from './controllers/home.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

const httpServer = createServer(app);

app.get('/',home);

//Swagger API Docs

const swaggerDocument = YAML.load(join(__dirname,'./docs/swagger.yaml'));

app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocument));

//Routes
app.use('/auth',authRouter);


//middlewares
app.use(cors())
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


//start server
const start = async () => {
    try {
      await connectDB(process.env.MONGO_URI);
      const PORT = process.env.PORT || 3000;

      httpServer.listen(PORT,()=>{
        console.log(`Server is running on http://localhost:${PORT}`);
        
      })

    } catch (error) {
       console.log(error);  
    }
};

start();

