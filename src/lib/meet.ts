import { MEET_CONFIG } from "@/configs/meet.config";
import { MeetingsDBModel } from "@/db/models/meets";
import { MeetType } from "@/types/Meet";
import { convertDateToCustomFormat } from "@/utils/time";

export const isMeetType = (obj: any): obj is MeetType => {
    return (
        typeof obj === 'object' &&
        obj.startDateTime instanceof Date &&
        obj.endDateTime instanceof Date &&
        typeof obj.createdBymployeeId === 'string' &&
        typeof obj.meetId === 'string' &&
        typeof obj.booked === 'boolean'

    );
};

export const isUpdateMeetType = (obj: any): boolean => {

    return (
        typeof obj === 'object' &&
        typeof obj.startDateTime === 'string' &&
        typeof obj.endDateTime === 'string' &&
        typeof obj.createdBymployeeId === 'string'


    );
};



export const isCreateableMeet = (obj: any): boolean => {
    const startDateTime = new Date(obj.startDateTime);
    const endDateTime = new Date(obj.endDateTime);

    return (
        typeof obj === 'object' &&
        !isNaN(startDateTime.getTime()) && 
        !isNaN(endDateTime.getTime()) &&
        typeof obj.createdBymployeeId === 'string'
    );
};


export const generateMeetingsForDay = (dateString: string) => {
    const possibleMeetings = []
    const dayStartTime = convertDateToCustomFormat(dateString, MEET_CONFIG.startTimeHourNumber, MEET_CONFIG.startTimeMinuteNumber);
    const dayEndTime = convertDateToCustomFormat(dateString, MEET_CONFIG.endTimeHourNumber, MEET_CONFIG.endTimeMinuteNumber)

    let traverseTime = dayStartTime;

    let i = 1;
    while (traverseTime.getTime() < dayEndTime.getTime()) {
        possibleMeetings.push({
            slotId: i,
            slotStartTime: traverseTime,
            slotEndTime: new Date(traverseTime.getTime() + (MEET_CONFIG.slotPeriodInMinutes * 60 * 1000)),
            booked: false,
            meetId: null
        })
        traverseTime = new Date(traverseTime.getTime() + (MEET_CONFIG.slotPeriodInMinutes * 60 * 1000))
        i = i + 1;
    }

    return possibleMeetings;

}


export const getAllSlots = async (date: string) => {
    const meetings = generateMeetingsForDay(date)
    const getMeetsforInputDay = await MeetingsDBModel.getMeetofDate(date)

    meetings.map((possibleSlot) => {
        getMeetsforInputDay.map((meet) => {
            if (
                (meet.startDateTime.getTime() === possibleSlot.slotStartTime.getTime() && meet.endDateTime.getTime() > possibleSlot.slotEndTime.getTime())
                ||
                (meet.startDateTime.getTime() < possibleSlot.slotStartTime.getTime() && meet.endDateTime.getTime() > possibleSlot.slotEndTime.getTime())
                ||
                (meet.startDateTime.getTime() < possibleSlot.slotStartTime.getTime() && meet.endDateTime.getTime() === possibleSlot.slotEndTime.getTime())
                ||
                (meet.startDateTime.getTime() === possibleSlot.slotStartTime.getTime() && meet.endDateTime.getTime() === possibleSlot.slotEndTime.getTime())



            ) {
                possibleSlot.booked = true;
                possibleSlot.meetId = meet.meetId
            }
        })
        return possibleSlot
    })
    return meetings;

}

export const getAvailableMeets = async (date: string) => {
    const allMeets = await getAllSlots(date);
    const availableMeets = allMeets.filter((meet) => {
        if (meet.booked === false) {
            return meet
        }
    })

    return availableMeets
}


export const checkIfMeetIsAvailable = async (date: string, startDateTime: Date, endDateTime: Date,meetId?:string): Promise<boolean> => {
    const allMeets = await getAllSlots(date);
    let slotAvailable = true;
    allMeets.forEach((meet) => {
        if (meet.booked === true &&
            (
            (startDateTime.getTime() === meet.slotStartTime.getTime() && endDateTime.getTime() > meet.slotEndTime.getTime())
            ||
            (startDateTime.getTime() < meet.slotStartTime.getTime() && endDateTime.getTime() > meet.slotEndTime.getTime())
            ||
            (startDateTime.getTime() < meet.slotStartTime.getTime() && endDateTime.getTime() === meet.slotEndTime.getTime())
            ||
            (startDateTime.getTime() === meet.slotStartTime.getTime() && endDateTime.getTime() === meet.slotEndTime.getTime())
            )
            
            && (meetId ? meetId !== meet.meetId : true)
        ) {
            slotAvailable = false
            return;
        }
    })
    return slotAvailable

}


export const meetExists = async(meetId:string)=>{
    const res = await MeetingsDBModel.getMeet(meetId)
    if(!!res){
        return true
    }else {
        return false
    }

}