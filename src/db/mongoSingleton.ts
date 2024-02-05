import { ENV_VAR } from "@/configs/env.config";
import { MongoClient, Db } from "mongodb";


// SINGLETON FOR MONGODB

class MongoDBClient{
    private  uri!: string ;
    private dbName!:string;
    private client!:MongoClient;
    private  dbConnection!: Db;
    private  dbInitialized!:boolean;
    private static instance: MongoDBClient;
    private dbInititializationAttempt! :boolean;
    public constructor(){
        try {
            
        this.uri =  ENV_VAR.MONGODB_URL;
        this.dbName = ENV_VAR.DB_NAME;
        this.client = new MongoClient(this.uri,{monitorCommands:true});
        this.dbInitialized=false;
        this.dbInititializationAttempt = false;
        
    } catch (error) {
     console.log("Failed to create MongoClient ")       
    }
    }

    public initMongoDB  = async() =>{
        if(this.dbInitialized){
            return;
        }
        try {
            await this.client.connect();
            console.log("MongoDB - Client connected");
            this.dbConnection =  this.client.db(this.dbName);
            console.log("MongoDB - DB Connection made")
            this.dbInitialized = true;

        } catch (error) {
            // await this.client.close()
            console.log("Failed to init MongoDB ")
        }
        finally{
            this.dbInititializationAttempt = true
        }
    }

    public  getDB = async():Promise<Db | undefined> => {
        if(!this.dbInitialized && !this.dbInititializationAttempt){
            await this.initMongoDB()
        }else if (!this.dbInitialized && this.dbInititializationAttempt){
            throw Error("Failed to initiliaze Mongo DB Connection")
        }else{

            return this.dbConnection
        }
    }

    public static getInstance = ()=>{
        if(!this.instance){
            this.instance = new MongoDBClient();
        }
        return this.instance;
    }
    // public  onlyGetDB = async():Promise<Db> => {
    //     if(!this.dbInitialized){
    //         throw Error("Cant connect to Database Try again later !")
    //     }else{

    //         return this.dbConnection
    //     }
    // }

}

export default MongoDBClient.getInstance();







