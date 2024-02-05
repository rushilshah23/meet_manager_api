import mongoDBInstance from "@/db/mongoSingleton";
import { MeetType } from "@/types/Meet";
import { v4 } from "uuid";

class MeetingsDBModel {
    private static async getCollection() {
        try {
            const dbConnection = await mongoDBInstance.getDB();
            if (dbConnection) {
                return dbConnection.collection("meetings");
            } else {
                throw new Error("DB not initialized");
            }
        } catch (error) {
            console.log("Error: DB not initialized");
            throw error;
        }
    }

    static async createMeet(meet: MeetType) {
        try {
            meet.startDateTime = new Date(meet.startDateTime)
            meet.endDateTime = new Date(meet.endDateTime)

            const meetCollection = await this.getCollection();
            const res = await meetCollection.insertOne(meet);
            return res
        } catch (error) {
            console.error("Error creating meet:", error);
            throw error;
        }
    }

    static async updateMeet(meetId: string, updatedMeetData: MeetType) {
        try {
            updatedMeetData.startDateTime = new Date(updatedMeetData.startDateTime)
            updatedMeetData.endDateTime = new Date(updatedMeetData.endDateTime)
            const meetCollection = await this.getCollection();

            const res = await meetCollection.updateOne({ meetId: meetId }, { $set: updatedMeetData });
            return res;
        } catch (error) {
            console.error("Error updating meet:", error);
            throw error;
        }
    }

    static async deleteMeet(meetId: string) {
        try {
            const meetCollection = await this.getCollection();
            const query = await meetCollection.deleteOne({ meetId: meetId });
            return query

        } catch (error) {
            console.error("Error deleting meet:", error);
            throw error;
        }
    }

    static async getMeet(meetId: string) {
        try {
            const meetCollection = await this.getCollection();
            const meet = await meetCollection.findOne({ meetId: meetId });
            return meet;
        } catch (error) {
            console.error("Error getting meet:", error);
            throw error;
        }
    }

    static async getMeetofDate(dateString: string) {
        try {
            // dateString is of format - 2024-01-01
            const meetCollection = await this.getCollection();
        
            const fromDate = new Date(dateString);
            const toDate = new Date(new Date(dateString).getTime() + 24 * 60 * 60 * 1000) 


            const meetingsForDate = await meetCollection.find({ startDateTime: { $gte: fromDate, $lt:toDate } }).toArray();
            return meetingsForDate;
        } catch (error) {
            console.error("Error getting meetings for date:", error);
            throw error;
        }
    }
}

export { MeetingsDBModel };
