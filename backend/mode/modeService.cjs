/**
 * MODE Galaxy Core Service Engine
 */

const Schedule = require("./models/scheduleModel.js");
const axios = require("axios");

module.exports = {
    async getEventPortalData(eventId) {
        return {
            eventId,
            sections: ["Pulse", "VenueTwin", "WrapUp", "GuestPortal"],
            status: "online"
        };
    },

    async getGuestPortalData(eventId) {
        return {
            eventId,
            welcome: "Welcome! Follow Pulse for schedule updates.",
            map: "/maps/event/" + eventId
        };
    },

    async getPulseTimeline(eventId) {
        const timeline = await Schedule.findOne({ eventId });
        return timeline || { eventId, segments: [] };
    },

    async getBusinessPulse(eventId) {
        return { eventId, businessMode: true };
    },

    async getVenueTwinData(eventId) {
        return {
            eventId,
            rooms: ["Lobby", "Ballroom", "Backstage", "Restrooms"],
            hologram: true
        };
    },

    async updateRunOfShow(eventId, update) {
        await Schedule.updateOne(
            { eventId },
            { $set: update },
            { upsert: true }
        );

        // Notify AURA Twin
        axios.post("/api/twins/mode/trigger", {
            action: "TIMELINE_UPDATE",
            payload: update
        });

        return { ok: true, eventId, update };
    },

    async pauseRunOfShow(eventId) {
        return this.updateRunOfShow(eventId, { paused: true });
    },

    async resumeRunOfShow(eventId) {
        return this.updateRunOfShow(eventId, { paused: false });
    },

    async scheduleChange(eventId, { message, newTime }) {
        // AURA Twin Announcement
        axios.post("/api/twins/mode/trigger", {
            action: "SCHEDULE_CHANGE",
            payload: { eventId, message, newTime }
        });

        return {
            ok: true,
            eventId,
            message,
            newTime,
            dispatched: true
        };
    },

    async processFranchisePayment(paymentInfo) {
        return { ok: true, paymentInfo, status: "processed" };
    }
};
