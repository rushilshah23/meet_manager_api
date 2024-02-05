import { config } from "dotenv";
import path from "path";

if (process.env.ENVIRONMENT !== 'PRODUCTION') {
    console.log("RUNNING IN DEVELOPMENT MODE")
    config({ path: path.resolve(__dirname, '../../.env.dev') });

} else {
    console.log("RUNNING IN PRODUCTION MODE ")
    // config();
    config({ path: path.resolve(__dirname, '../../.env') });

}

const {
    SERVER_PORT,
    CLIENT_URL,
    ENVIRNOMENT,
    MONGODB_URL,
    DB_NAME
} = process.env;





export const ENV_VAR = {
    SERVER_PORT: SERVER_PORT!,
    CLIENT_URL: CLIENT_URL!,
    ENVIRNOMENT: ENVIRNOMENT! === 'DEVELOPMENT' ? false : true,
    MONGODB_URL: MONGODB_URL!,
    DB_NAME: DB_NAME!

} 


console.log(ENV_VAR)