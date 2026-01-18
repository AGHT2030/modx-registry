/**
 * © 2025 AG Holdings Trust | Oversite Council Router
 * Handles authentication + anomaly pushes for Oversite Council.
 */

const express = require("express");
const router = express.Router();

module.exports = (io) => {

    // Socket layer: authenticate Oversite Council
    io.on("connection", (socket) => {

        socket.on("oversite:auth:check", () => {
            const role = socket.handshake.auth?.role;

            if (role === "oversite") {
                socket.emit("oversite:auth:result", { allowed: true });
            } else {
                socket.emit("oversite:auth:result", { allowed: false });

                console.log("⚠ Unauthorized Oversite Council attempt:", socket.id);
            }
        });
    });

    return router;
};
