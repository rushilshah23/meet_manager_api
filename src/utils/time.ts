import { MEET_CONFIG } from "@/configs/meet.config";

export const extractTime = (dateTimeString: Date) => {
    const dateObj = new Date(dateTimeString);
    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes();
    const seconds = dateObj.getUTCSeconds();
    const year = dateObj.getUTCFullYear();
    const month = `0${dateObj.getUTCMonth() + 1}`.slice(-2); // Adding 1 as months are zero-indexed
    const day = `0${dateObj.getUTCDate()}`.slice(-2);

    const date = `${year}-${month}-${day}`

    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds) || date === "NaN-aN-aN") {
        // console.log("Improper date string")
        throw Error("Improper date string")
    }
    return {
        "hours": hours,
        "minutes": minutes,
        "seconds": seconds,
        "date": date
    }
}

export const convertDateToCustomFormat = (dateString: string, hoursToAdd: number, minutesToAdd: number) => {
    const date = new Date(dateString);
    date.setUTCHours(date.getUTCHours() + hoursToAdd);
    date.setUTCMinutes(date.getUTCMinutes() + minutesToAdd);

    return date; // Returns in the format: 'YYYY-MM-DDTHH:mm:ss.sssZ'
}

export const getNextSlotDateTime = (dateString: string, startHours: number, startMinutes: number) => {
    const formattedHours = startHours.toString().padStart(2, '0');
    const formattedMinutes = startMinutes.toString().padStart(2, '0');

    const date = new Date(`${dateString}T${formattedHours}:${formattedMinutes}:00.000+00:00`);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date and time");
    }

    const nextSlotTime = new Date(date.getTime() + (MEET_CONFIG.slotPeriodInMinutes * 60 * 1000));

    if (isNaN(nextSlotTime.getTime())) {
        throw new Error("Invalid next slot time");
    }

    return nextSlotTime.toISOString();
};



export const roundDownTime = (hours: number, minutes: number) => {
    let roundDownMinutes = 0;
    let roundDownHours = hours;
    if (minutes >= MEET_CONFIG.slotPeriodInMinutes) {
        roundDownMinutes = MEET_CONFIG.slotPeriodInMinutes
    } else {
        roundDownMinutes = 0;
    }

    return {
        "roundDownHours": roundDownHours,
        "roundDownMinutes": roundDownMinutes
    }
}

export const roundUpTime = (hours: number, minutes: number) => {
    let roundUpMinutes = minutes;
    let roundUpHours = hours;
    if (minutes > MEET_CONFIG.slotPeriodInMinutes) {
        roundUpMinutes = 0;
        roundUpHours = roundUpHours + 1
    } else if (minutes < MEET_CONFIG.slotPeriodInMinutes && minutes !== 0) {
        roundUpMinutes = MEET_CONFIG.slotPeriodInMinutes;
    }

    return {
        "roundUpHours": roundUpHours,
        "roundUpMinutes": roundUpMinutes
    }
}

export const isPositiveDifferenceinDates = (date1: Date, date2: Date) => {


    if (date1 < date2) {
        return true
    }

    return false
}
export const inValidRange = async (startTimeHour: number, startTimeMinute: number, endTimeHour: number, endTimeMinute: number) => {
    let response = {
        "isValid": true,
        "message": ""
    }
    if (startTimeHour < MEET_CONFIG.startTimeHourNumber) {
        response = {
            isValid: false,
            message: `Day starts at ${MEET_CONFIG.startTimeHour} hours`
        }
    }
    if (endTimeHour > MEET_CONFIG.endTimeHourNumber) {
        response = {
            isValid: false,
            message: `Day ends at ${MEET_CONFIG.endTimeHour} hours`
        }
    }

    if (response.isValid === true) {
        response = {
            isValid: true,
            message: "Valid time range"
        }
    }

    return response



}