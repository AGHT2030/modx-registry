module.exports = function (io) {
    global.IO = io;

    setInterval(() => {
        io.emit("defense:tick", {
            drift: AURA.lastDrift,
            c5: C5.getLevel(),
            arbitrageFrozen: global.ETF_FROZEN,
            timestamp: Date.now()
        });
    }, 3000);
};
