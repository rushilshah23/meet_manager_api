import { HTTP_STATUS_CODES } from "@/configs/httpStatusCodes.config";
import { MeetingsDBModel } from "@/db/models/meets";
import { checkIfMeetIsAvailable, generateMeetingsForDay, getAvailableMeets, isCreateableMeet, isMeetType, isUpdateMeetType, meetExists } from "@/lib/meet";
import { MeetType } from "@/types/Meet";
import { convertDateToCustomFormat, extractTime, inValidRange, isPositiveDifferenceinDates, roundDownTime, roundUpTime } from "@/utils/time";
import { Request, Response } from "express";
import { v4 } from "uuid";

// Function to get available slots for a specific day
export const getAvailableSlotsForDay = async (req: Request, res: Response) => {
    const { date } = req.params; // Assuming date format is YYYY-MM-DD

    // Get all meetings for the given date
    // const meetingsForDate = await MeetingsDBModel.getMeetofDate(date);
    const meetingsForDate = await getAvailableMeets(date)

    return res.json(meetingsForDate)

};

export const scheduleMeet = async (req: Request, res: Response) => {
    if (!req.body.meet) {
        return res.status(HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE).json("Please provide meet details to create");
    }

    if (!isCreateableMeet(req.body.meet)) {
        return res.status(HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE).json("Please provide valid meet details");

    }
    const meet: MeetType = req.body.meet;


    const startDateTimeExtract = extractTime(meet.startDateTime);

    const { roundDownHours, roundDownMinutes } = roundDownTime(startDateTimeExtract.hours, startDateTimeExtract.minutes);

    const endDateTimeExtract = extractTime(meet.endDateTime);

    const { roundUpHours, roundUpMinutes } = roundUpTime(endDateTimeExtract.hours, endDateTimeExtract.minutes);

    const timeValidityCheck = await inValidRange(roundDownHours, roundDownMinutes, roundUpHours, roundUpMinutes)

    if(!isPositiveDifferenceinDates(meet.startDateTime,meet.endDateTime)){
        return res.status(HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE).json("Please provide proper start and end time")
    }

    if (timeValidityCheck.isValid) {
        // console.log(startDateTimeExtract.date)
        // console.log(endDateTimeExtract.date)
        // generateMeetingsForDay(startDateTimeExtract.date)
        meet.startDateTime = convertDateToCustomFormat(startDateTimeExtract.date, roundDownHours, roundDownMinutes);
        meet.endDateTime = convertDateToCustomFormat(endDateTimeExtract.date, roundUpHours, roundUpMinutes);


        // Check if the slot is available
        const isMeetAvailable = await checkIfMeetIsAvailable(startDateTimeExtract.date, meet.startDateTime, meet.endDateTime);
        if (!isMeetAvailable) {
            return res.status(HTTP_STATUS_CODES.HTTP_409_CONFLICT).json("Meet is already booked by other employee")
        }
        const meetId = v4()
        meet.meetId = meetId;
        meet.booked = true
        const createdMeetRes = await MeetingsDBModel.createMeet(meet)
        if (!!createdMeetRes) {
            return res.status(200).json(createdMeetRes)
        }
    }
    if (timeValidityCheck.isValid === false) {
        return res.status(HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE).json(timeValidityCheck.message)
    }


    return res.status(HTTP_STATUS_CODES.HTTP_500_INTERNAL_SERVER_ERROR).json("Something went wrong")
}

export const rescheduleMeet = async (req: Request, res: Response) => {
    if (!req.params.meetId) {
        return res.status(HTTP_STATUS_CODES.HTTP_400_BAD_REQUEST).json("Provide the meet ID to update")
    }
    if (!req.body.meet) {
        return res.status(HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE).json("Provide the meet details to update")
    }
    if (!isUpdateMeetType(req.body.meet)) {
        return res.status(HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE).json("Provide all neecessary meet details to update")

    }



    // -----------------


    const meet: MeetType = req.body.meet;
    req.body.meet.meetId = req.params.meetId;

    const startDateTimeExtract = extractTime(meet.startDateTime);

    const { roundDownHours, roundDownMinutes } = roundDownTime(startDateTimeExtract.hours, startDateTimeExtract.minutes);

    const endDateTimeExtract = extractTime(meet.endDateTime);

    const { roundUpHours, roundUpMinutes } = roundUpTime(endDateTimeExtract.hours, endDateTimeExtract.minutes);

    const timeValidityCheck = await inValidRange(roundDownHours, roundDownMinutes, roundUpHours, roundUpMinutes)



    if (timeValidityCheck.isValid) {
        // console.log(startDateTimeExtract.date)
        // console.log(endDateTimeExtract.date)
        // generateMeetingsForDay(startDateTimeExtract.date)
        meet.startDateTime = convertDateToCustomFormat(startDateTimeExtract.date, roundDownHours, roundDownMinutes);
        meet.endDateTime = convertDateToCustomFormat(endDateTimeExtract.date, roundUpHours, roundUpMinutes);

        if(!isPositiveDifferenceinDates(meet.startDateTime,meet.endDateTime)){
            return res.status(HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE).json("Please provide proper start and end time")
        }
        // Check if the slot is available
        const isMeetAvailable = await checkIfMeetIsAvailable(startDateTimeExtract.date, meet.startDateTime, meet.endDateTime,req.params.meetId);
        if (!isMeetAvailable) {
            return res.status(HTTP_STATUS_CODES.HTTP_409_CONFLICT).json("Meet is already booked by other employee")
        }
        const meetId = req.params.meetId
        meet.meetId = meetId;
        meet.booked = true
        const rescheduleRes = await MeetingsDBModel.updateMeet(req.params.meetId, req.body.meet)
        if (!!rescheduleRes) {
            return res.status(200).json(rescheduleRes)
        }
    }
    if (timeValidityCheck.isValid === false) {
        return res.status(HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE).json(timeValidityCheck.message)
    }


    return res.status(HTTP_STATUS_CODES.HTTP_500_INTERNAL_SERVER_ERROR).json("Something went wrong")

}


export const cancelMeet = async (req: Request, res: Response) => {
    if(!req.params.meetId){
        return res.status(HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE).json("Provide the meetId to cancel")
    }

    const queryRes = await MeetingsDBModel.deleteMeet(req.params.meetId);

    if(!!queryRes){
        return res.status(200).json("Meet cancelled")
    }
}





export const bulkRescheduleMeet = async (req: Request, res: Response) => {
    try {
        if (!req.body.meets || !Array.isArray(req.body.meets) || req.body.meets.length === 0) {
            return res.status(HTTP_STATUS_CODES.HTTP_400_BAD_REQUEST).json("Provide an array of meets to update");
        }

        const meets: MeetType[] = req.body.meets;
        let arrayResponse: { status: HTTP_STATUS_CODES; message: string; }[] = [];
        // Iterate through the array of meets for bulk rescheduling
            for(const meet of meets){


                if(await meetExists(meet.meetId) === false){
                    arrayResponse.push({
                        status:HTTP_STATUS_CODES.HTTP_404_NOT_FOUND,
                        message:`${meet.meetId} -  MeetId doesn't exists`
                    })
                    continue;
                }
                // Perform similar logic as in the rescheduleMeet function for each meet
                // Extract, round down/up, check validity, and update the meet
                const startDateTimeExtract = extractTime(meet.startDateTime);
                const { roundDownHours, roundDownMinutes } = roundDownTime(startDateTimeExtract.hours, startDateTimeExtract.minutes);
                const endDateTimeExtract = extractTime(meet.endDateTime);
                const { roundUpHours, roundUpMinutes } = roundUpTime(endDateTimeExtract.hours, endDateTimeExtract.minutes);

                const timeValidityCheck = await inValidRange(roundDownHours, roundDownMinutes, roundUpHours, roundUpMinutes);

                if (timeValidityCheck.isValid) {
                    meet.startDateTime = convertDateToCustomFormat(startDateTimeExtract.date, roundDownHours, roundDownMinutes);
                    meet.endDateTime = convertDateToCustomFormat(endDateTimeExtract.date, roundUpHours, roundUpMinutes);

                    if (!isPositiveDifferenceinDates(meet.startDateTime, meet.endDateTime)) {
                        arrayResponse.push({
                            "status":HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE,
                            "message":`${meet.meetId} - Please provide proper start and end time`
                        })
                        continue;
                    }

                    // Check if the slot is available
                    const isMeetAvailable = await checkIfMeetIsAvailable(startDateTimeExtract.date, meet.startDateTime, meet.endDateTime, meet.meetId);
                    if (!isMeetAvailable) {
                        arrayResponse.push({
                            "status":HTTP_STATUS_CODES.HTTP_409_CONFLICT,
                            "message":`${meet.meetId} - Meet is already booked by other employee`
                        })
                        continue;
                    }

                    meet.booked = true;
                    const rescheduleRes = await MeetingsDBModel.updateMeet(meet.meetId, meet);
                    console.log("Logging to update")
                    arrayResponse.push({
                        "status":HTTP_STATUS_CODES.HTTP_200_OK,
                        "message":`${meet.meetId} - Meet updated`
                    })
                    continue;
                }

                if (timeValidityCheck.isValid === false) {
                    arrayResponse.push({
                        "status":HTTP_STATUS_CODES.HTTP_406_NOT_ACCEPTABLE,
                        "message":`${meet.meetId} - ${timeValidityCheck.message}`
                    })
                    continue;
                }

            }

        return res.status(HTTP_STATUS_CODES.HTTP_200_OK).json(arrayResponse);
    } catch (error) {
        console.error("Error during bulk rescheduling:", error);
        return res.status(HTTP_STATUS_CODES.HTTP_500_INTERNAL_SERVER_ERROR).json("Something went wrong");
    }
};




export const bulkDeleteMeets = async (req: Request, res: Response) => {
    try {
        if (!req.body.meets || !Array.isArray(req.body.meets) || req.body.meets.length === 0) {
            return res.status(HTTP_STATUS_CODES.HTTP_400_BAD_REQUEST).json("Provide an array of meetIds to delete");
        }

        const meetIds: string[] = req.body.meets;
        let arrayResponse: { status: HTTP_STATUS_CODES; message: string; }[] = [];

        for (const meetId of meetIds) {
            // Check if the meet exists
            if (!(await meetExists(meetId))) {
                arrayResponse.push({
                    status: HTTP_STATUS_CODES.HTTP_404_NOT_FOUND,
                    message: `${meetId} - MeetId doesn't exist`
                });
                continue;
            }

            // Delete the meet
            const deleteResult = await MeetingsDBModel.deleteMeet(meetId);

            if (!!deleteResult) {
                arrayResponse.push({
                    status: HTTP_STATUS_CODES.HTTP_200_OK,
                    message: `${meetId} - Meet deleted successfully`
                });
            } else {
                arrayResponse.push({
                    status: HTTP_STATUS_CODES.HTTP_500_INTERNAL_SERVER_ERROR,
                    message: `${meetId} - Failed to delete meet`
                });
            }
        }

        return res.status(HTTP_STATUS_CODES.HTTP_200_OK).json(arrayResponse);
    } catch (error) {
        console.error("Error during bulk meet deletion:", error);
        return res.status(HTTP_STATUS_CODES.HTTP_500_INTERNAL_SERVER_ERROR).json("Something went wrong");
    }
};
