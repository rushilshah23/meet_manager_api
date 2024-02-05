import { DateSchemaDefinition } from "mongoose"

export type MeetType = {
    startDateTime:Date,
    endDateTime:Date
    createdBymployeeId:string,
    meetId:string,
    booked:boolean
}