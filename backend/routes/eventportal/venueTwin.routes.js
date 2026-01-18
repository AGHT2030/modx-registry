module.exports = (req, res) => {
    const { eventId } = req.params;
    const { mapData } = req.body;

    global.VENUE_TWIN[eventId] = mapData;

    return res.json({
        eventId,
        status: "VENUE_UPDATED",
        geoFence: true,
        aiRouting: true
    });
};
