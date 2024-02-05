import bodyParser from "body-parser"
import express from "express"
import { schedulerRoutes } from "@/routers/scheduler"
import mongoDBInstance from "@/db/mongoSingleton"
import { ENV_VAR } from "./configs/env.config"
const app = express()


app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended:true}))





app.use("/api/scheduler",schedulerRoutes)


app.listen(ENV_VAR.SERVER_PORT,async()=>{
    await mongoDBInstance.initMongoDB()
    console.log(`Server running on ${ENV_VAR.SERVER_PORT}`)
})


export{app}