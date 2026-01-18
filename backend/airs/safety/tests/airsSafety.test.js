// © 2025 AIMAL Global Holdings | AIRS Safety Test Suite
// ------------------------------------------------------
// Tests included:
//   ✓ Soft Stop
//   ✓ Hard Stop
//   ✓ Incident
//   ✓ Redirect
//   ✓ Event Processor
//   ✓ Emergency Override
//   ✓ SIT Log Integrity (PQC hash validation)
//   ✓ Telemetry packet propagation (AURA + MODLINK stubs)
// ------------------------------------------------------

const request = require("supertest");
const { app } = require("../../../../server"); // adjust path if needed

// Optional: mock AURA + MODLINK global emitters to avoid errors during test
global.AURA = { broadcast: jest.fn() };
global.MODLINK = { emit: jest.fn() };

describe("AIRS Safety API — Complete Validation Suite", () => {

    // Standard test payload generator
    const basePayload = () => ({
        session: {},
        twinId: "TWIN_TEST_001",
        location: { lat: 35.1495, lng: -90.0490 }
    });

    // ------------------------------------------
    // SOFT STOP
    // ------------------------------------------
    test("Soft Stop works", async () => {
        const res = await request(app)
            .post("/airs/safety/stop")
            .send(basePayload());

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("STOPPED");
        expect(res.body.event).toHaveProperty("rideId");
        expect(res.body.event).toHaveProperty("pqcHash");
    });

    // ------------------------------------------
    // HARD STOP
    // ------------------------------------------
    test("Hard Stop works", async () => {
        const res = await request(app)
            .post("/airs/safety/hard-stop")
            .send(basePayload());

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("HARD_STOPPED");
        expect(res.body.event.action).toBe("HARD_STOP");
    });

    // ------------------------------------------
    // INCIDENT
    // ------------------------------------------
    test("Incident logs correctly", async () => {
        const payload = basePayload();
        payload.details = { severity: "HIGH", message: "Test incident" };

        const res = await request(app)
            .post("/airs/safety/incident")
            .send(payload);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("INCIDENT_RECORDED");
        expect(res.body.event.details.message).toBe("Test incident");
    });

    // ------------------------------------------
    // REDIRECT
    // ------------------------------------------
    test("Redirect works", async () => {
        const payload = basePayload();
        payload.target = "SAFE_HUB";

        const res = await request(app)
            .post("/airs/safety/redirect")
            .send(payload);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("REDIRECTING");
        expect(res.body.event.target).toBe("SAFE_HUB");
    });

    // ------------------------------------------
    // PROCESSOR — route events to SIT/PQC/MODLINK/AURA
    // ------------------------------------------
    test("Event Processor works", async () => {
        const res = await request(app)
            .post("/airs/safety/process")
            .send({
                type: "GENERIC",
                session: {},
                twinId: "TEST",
                payload: { msg: "processor test" }
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.processed).toBe(true);
        expect(global.MODLINK.emit).toHaveBeenCalled();
    });

    // ------------------------------------------
    // EMERGENCY STOP — highest priority
    // ------------------------------------------
    test("Emergency Stop triggers", async () => {
        const res = await request(app)
            .post("/airs/safety/emergency-stop")
            .send(basePayload());

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("EMERGENCY_OVERRIDE");
        expect(res.body.event.severity).toBe("CRITICAL");
    });

    // ------------------------------------------
    // SIT + PQC INTEGRITY TEST
    // ------------------------------------------
    test("SIT Log Integrity Check (PQC hash validation)", async () => {
        const res = await request(app)
            .post("/airs/safety/stop")
            .send(basePayload());

        const event = res.body.event;
        expect(event).toBeDefined();

        // recompute hash manually
        const pqc = require("../../security/pqc/pqcSafety");
        const recalculated = pqc.hashEvent(event.action, event);

        expect(event.pqcHash).toBe(recalculated);
    });

    // ------------------------------------------
    // TELEMETRY VALIDATION (non-failing assertions)
    // ------------------------------------------
    test("Telemetry packets broadcast to AURA + MODLINK", async () => {
        await request(app)
            .post("/airs/safety/stop")
            .send(basePayload());

        expect(global.AURA.broadcast).toHaveBeenCalled();
        expect(global.MODLINK.emit).toHaveBeenCalled();
    });
});

