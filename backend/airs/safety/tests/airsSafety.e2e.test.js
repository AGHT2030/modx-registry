// © 2025 AIMAL Global Holdings | AIRS End-to-End Safety Test Mode
// -----------------------------------------------------------------------------
// This test simulates a full AIRS ride from beginning to emergency termination.
// -----------------------------------------------------------------------------
// FLOW:
//   1. Start session / assign rideId
//   2. Soft Stop
//   3. Hard Stop
//   4. Incident -> SIT log + PQC hash
//   5. Redirect to SAFE HUB
//   6. Emergency Override (max priority event)
//   7. Validate telemetry + MODLINK + AURA sync
// -----------------------------------------------------------------------------

const request = require("supertest");
const { app } = require("../../../../server");

// Mock global event buses (prevent actual network triggers)
global.AURA = { broadcast: jest.fn() };
global.MODLINK = { emit: jest.fn() };

describe("AIRS End-to-End Safety Test Mode", () => {

    let session = {}; // will be mutated by AIRS Safety Engine
    const twinId = "E2E_TWIN_001";
    const location = { lat: 35.1495, lng: -90.0490 };

    const req = (path, body = {}) =>
        request(app).post(path).send(body);

    // -------------------------------------------------------------------------
    // 1. START SESSION — implicit via soft stop creating rideId
    // -------------------------------------------------------------------------
    test("BEGIN → Soft Stop initializes ride session + rideId", async () => {
        const res = await req("/airs/safety/stop", { session, twinId, location });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("STOPPED");

        session = res.body.event.session ? res.body.event.session : session;
        expect(res.body.event.rideId).toBeDefined();

        // Save rideId for later tests
        session.rideId = res.body.event.rideId;
    });

    // -------------------------------------------------------------------------
    // 2. HARD STOP
    // -------------------------------------------------------------------------
    test("Hard Stop registers correctly with same rideId", async () => {
        const res = await req("/airs/safety/hard-stop", { session, twinId, location });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("HARD_STOPPED");
        expect(res.body.event.rideId).toBe(session.rideId);
    });

    // -------------------------------------------------------------------------
    // 3. INCIDENT
    // -------------------------------------------------------------------------
    test("Incident logs + PQC hashing integrity", async () => {
        const res = await req("/airs/safety/incident", {
            session,
            twinId,
            location,
            details: { severity: "HIGH", msg: "E2E simulated incident" }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("INCIDENT_RECORDED");
        expect(res.body.event.details.msg).toBe("E2E simulated incident");
        expect(res.body.event.pqcHash).toBeDefined();
    });

    // -------------------------------------------------------------------------
    // 4. REDIRECT
    // -------------------------------------------------------------------------
    test("Redirect to SAFE_HUB works + maintains rideId continuity", async () => {
        const res = await req("/airs/safety/redirect", {
            session,
            twinId,
            target: "SAFE_HUB",
            location
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("REDIRECTING");
        expect(res.body.event.target).toBe("SAFE_HUB");
        expect(res.body.event.rideId).toBe(session.rideId);
    });

    // -------------------------------------------------------------------------
    // 5. EMERGENCY OVERRIDE — final authority
    // -------------------------------------------------------------------------
    test("Emergency Override halts everything + produces CRITICAL event", async () => {
        const res = await req("/airs/safety/emergency-stop", {
            session,
            twinId,
            location
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("EMERGENCY_OVERRIDE");
        expect(res.body.event.severity).toBe("CRITICAL");
        expect(res.body.event.action).toBe("EMERGENCY_STOP");
    });

    // -------------------------------------------------------------------------
    // 6. TELEMETRY + GLOBAL BUS
    // -------------------------------------------------------------------------
    test("AURA + MODLINK telemetry sync events fired", () => {
        expect(global.AURA.broadcast).toHaveBeenCalled();
        expect(global.MODLINK.emit).toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // 7. CLEANUP
    // -------------------------------------------------------------------------
    test("Final ride status packaged correctly", () => {
        expect(session.rideId).toBeDefined();
        console.log("\n🔥 E2E Ride Completed Successfully — RideId:", session.rideId, "\n");
    });

});
