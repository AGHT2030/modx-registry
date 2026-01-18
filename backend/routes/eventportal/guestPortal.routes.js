module.exports = (req, res) => {
    const { eventId } = req.params;

    return res.json({
        eventId,
        portal: "EVENT_PORTAL",
        auraWelcome: true,
        pulseLive: true,
        venueTwin: true,
        nfts: true,
        gifting: true,
        nextActions: [
            "VIEW_TIMELINE",
            "NAVIGATE_VENUE",
            "JOIN_LIVESTREAM",
            "GET_UPDATES",
            "EXPLORE_MODX"
        ]
    });
};
