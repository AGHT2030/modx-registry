/**
 * © 2025 AG Holdings Trust | MODX Sovereign Runtime
 * ------------------------------------------------
 * NO-LISTEN GUARD
 *
 * Prevents any module except server.js from calling:
 *   - app.listen()
 *   - server.listen()
 *
 * This enforces a single sovereign transport owner.
 */

const path = require("path");

const ALLOWED_CALLERS = [
    "server.js" // ONLY this file may call listen()
];

function isAllowedCaller(stack) {
    return ALLOWED_CALLERS.some(file => stack.includes(file));
}

function trapListen(original, label) {
    return function guardedListen(...args) {
        const stack = new Error().stack || "";

        if (!isAllowedCaller(stack)) {
            console.error(`
🛑 SOVEREIGN TRANSPORT VIOLATION
--------------------------------
A module attempted to call ${label}.listen()

This is FORBIDDEN.

Caller stack:
${stack}
`);
            throw new Error(`Forbidden ${label}.listen() call`);
        }

        return original.apply(this, args);
    };
}

module.exports = function enforceNoListenGuard({ app, server }) {
    if (app?.listen) {
        app.listen = trapListen(app.listen, "express");
    }

    if (server?.listen) {
        server.listen = trapListen(server.listen, "http");
    }

    console.log("🔒 No-Listen Guard ACTIVE — transport sovereignty enforced");
};
