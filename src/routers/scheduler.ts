import router from "express"
import { bulkDeleteMeets, bulkRescheduleMeet, cancelMeet, getAvailableSlotsForDay, rescheduleMeet, scheduleMeet } from "@/controllers/scheduler"


const schedulerRoutes = router()


schedulerRoutes.get("/available-slots/:date",getAvailableSlotsForDay)

schedulerRoutes.post("/schedule-meeting",scheduleMeet)

schedulerRoutes.put("/reschedule-meeting/:meetId",rescheduleMeet)

schedulerRoutes.delete("/cancel-meeting/:meetId",cancelMeet)

schedulerRoutes.put("/bulk-update-meetings",bulkRescheduleMeet)

schedulerRoutes.delete("/bulk-cancel-meetings",bulkDeleteMeets)

// schedulerRoutes.get("/all-meets",getAllMeets)

export {
    schedulerRoutes
}