module.exports = (req, res) => {
    const { eventId } = req.params;
    const timeline = req.body;

    global.PULSE.emit("event.timeline.update", { eventId, timeline });

    return res.json({
        updated: true,
        eventId,
        timeline,
        auraScriptsGenerated: true
    });
};
