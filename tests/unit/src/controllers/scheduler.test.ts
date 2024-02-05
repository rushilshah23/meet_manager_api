import request from "supertest"
import { app } from "@/app"
import assert from "assert"


test("Scheduler router test", async () => {

    type AvailableMeets = {
        "slotId": string,
        "slotStartTime": string,
        "slotEndTime": string,
        "booked": boolean,
        "meetId": null | string
    }[]

    const response = await request("http://localhost:5000")
        .get("/api/scheduler/available-slots/2024-01-01")
        .expect('Content-Type', "application/json; charset=utf-8")
        // .expect('Content-Length', '2278')
        .expect(200)
        
     
        expect(response.body).toMatchObject<AvailableMeets>([
            {
              slotId: expect.any(String),
              slotStartTime: expect.any(String),
              slotEndTime: expect.any(String),
              booked: expect.any(Boolean),
              meetId: expect.anything(),
            },
            // Add more objects as needed
          ]);
   

})


