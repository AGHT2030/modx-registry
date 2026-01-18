module.exports = (req, res) => {
    const { eventId } = req.params;

    return res.json({
        eventId,
        console: "EVENT_COORDINATOR",
        timelineEditor: true,
        wrapUpScheduling: true,
        pulseTriggers: true,
        auraTwinScriptEditor: true,
        guestListManager: true,
        seating: true,
        staffAssignments: true,
        hotelIntegration: true,
        creatvLiveControl: true
    });
};
