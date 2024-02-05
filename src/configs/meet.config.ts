const startTimeHourNumber = 9;
const startTimeMinuteNumber = 0;
 const endTimeHourNumber = 18;
 const endTimeMinuteNumber = 0;

const MEET_CONFIG = {
    slotPeriodInMinutes:30,
    startTimeHour:startTimeHourNumber.toString().padStart(2, '0'),
    startTimeMinute:startTimeMinuteNumber.toString().padStart(2, '0'),
    endTimeHour:endTimeHourNumber.toString().padStart(2, '0'),
    endTimeMinute:endTimeMinuteNumber.toString().padStart(2, '0'),
    startTimeHourNumber:startTimeHourNumber,
    startTimeMinuteNumber:startTimeMinuteNumber,
    endTimeHourNumber:endTimeHourNumber,
    endTimeMinuteNumber:endTimeMinuteNumber



}


// const slots = 
//     [
//         {
//             "slotNumber":1,
//             "startTimeHour":9,
//             "startTimeMinutes":0,
//             "endTimeHour":

//         }
//     ]





// console.log(MEET_CONFIG)
export {MEET_CONFIG}