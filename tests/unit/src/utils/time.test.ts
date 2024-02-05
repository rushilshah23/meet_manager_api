import { convertDateToCustomFormat, extractTime, getNextSlotDateTime } from "@/utils/time"


describe("Test Time util functions ", () => {

    describe("Test cases from extract time function", () => {

        test('Extract time from date string -1 ', () => {
            const date = new Date("2024-01-01T10:00:00.000+00:00")
            expect(extractTime(date)).toEqual({
                "hours": 10,
                "minutes": 0,
                "seconds": 0,
                "date": "2024-01-01"
            })
        })

        test('Extract time from date string -2 ', () => {
            const date = new Date("2024-31-31T10:00:00.000+00:00")
            expect(() => extractTime(date)).toThrow()
        })

        test('Extract time from date string -3 ', () => {
            const date = new Date("2024-12-31T25:00:00.000+00:00")
            expect(() => extractTime(date)).toThrow()
        })

        test('Extract time from date string -4 ', () => {
            const date = new Date("2024-12-31T24:00:00.000+00:00")
            expect(extractTime(date)).toEqual({
                "hours": 0,
                "minutes": 0,
                "seconds": 0,
                "date": "2025-01-01"
            })
        })

        test('Extract time from date string -5 ', () => {
            const date = new Date("2024-12-31T00:00:00.000+00:00")
            expect(extractTime(date)).toEqual({
                "hours": 0,
                "minutes": 0,
                "seconds": 0,
                "date": "2024-12-31"
            })
        })
    })



    describe("Add hours minutes to a Date String",()=>{
        test("Case -1 ",()=>{
            expect(convertDateToCustomFormat("2024-01-01T10:00:00.000+00:00",2,2)).toEqual(new Date("2024-01-01T12:02:00.000Z"))
        })

        test("Case -2 ",()=>{
            expect(convertDateToCustomFormat("2024-01-01T10:00:00.000+00:00",2,2)).toEqual(new Date("2024-01-01T12:02:00.000Z"))
        })
    })

    describe("Get next slot ",()=>{
        test("Case-1",()=>{
            expect(getNextSlotDateTime("2024-01-01",20,0)).toEqual("2024-01-01T20:30:00.000Z")
        })

        test("Case-2",()=>{
            expect(getNextSlotDateTime("2024-01-01",2,5)).toEqual("2024-01-01T02:35:00.000Z")
        })

        test("Case-3",()=>{
            expect(()=>getNextSlotDateTime("2024-01-01T20:30:00.000Z",20,0)).toThrow("Invalid date and time")
        })
    })
})