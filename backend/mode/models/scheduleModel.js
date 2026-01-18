const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    eventId: { type: String, required: true },
    segments: [
        {
            label: String,
            time: String,
            completed: Boolean
        }
    ],
    paused: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ModeSchedule", ScheduleSchema);
