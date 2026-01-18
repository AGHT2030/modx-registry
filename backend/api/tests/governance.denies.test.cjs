"use strict";

const express = require("express");
const request = require("supertest");

const governanceRouter = require("../governance.cjs");

function makeApp() {
    const app = express();
    app.use(express.json());
    global.GOVBUS = global.GOVBUS || { emit: () => { } };
    app.use("/api/governance", governanceRouter);
    return app;
}

describe("Governance API — denial paths", () => {

    test("DENY missing MODLINK proof on proposal creation", async () => {
        const app = makeApp();
        const res = await request(app)
            .post("/api/governance/proposal")
            .send({ id: "p1", action: "ETF_INCREASE_CEILING", params: {} });

        expect(res.status).toBe(403);
        expect(res.body.reason).toBe("DENY_MISSING_MODLINK_PROOF");
    });

    test("DENY missing MODLINK proof on proposal execution", async () => {
        const app = makeApp();
        const res = await request(app)
            .post("/api/governance/proposal/p1/execute")
            .send({});

        expect(res.status).toBe(403);
        expect(res.body.reason).toBe("DENY_MISSING_MODLINK_PROOF");
    });
    test("DENY timelock not satisfied (policy deny)", async () => {
        const app = express();
        app.use(express.json());

        // Minimal GOVBUS stub
        global.GOVBUS = global.GOVBUS || { emit: () => { } };

        // Shim governance attachment (simulates successful MODLINK proof)
        const shimGovernance = (action) => (req, _res, next) => {
            req.governance = {
                action,
                sub: "trustee:TEST",
                correlationId: "test-cid"
            };
            next();
        };

        // Local router using the same timelock logic
        const router = express.Router();

        const { getTimelockSeconds, DENY_REASONS } =
            require("../governance.cjs")._test;

        let active = {};

        router.post(
            "/proposal",
            shimGovernance("GOV_PROPOSAL_CREATE"),
            (req, res) => {
                active["p2"] = {
                    id: "p2",
                    action: "TEST",
                    createdAt: Date.now(),
                    timelockSeconds: 60
                };
                res.json({ ok: true });
            }
        );

        router.post(
            "/proposal/p2/execute",
            shimGovernance("GOV_PROPOSAL_EXECUTE"),
            (req, res) => {
                const p = active["p2"];
                const t = getTimelockSeconds(p);
                const earliest = p.createdAt + t * 1000;
                if (Date.now() < earliest) {
                    return res.status(403).json({
                        error: "GOVERNANCE_DENIED",
                        reason: DENY_REASONS.DENY_POLICY
                    });
                }
                res.json({ ok: true });
            }
        );

        app.use("/api/governance", router);

        await request(app).post("/api/governance/proposal").send({});
        const r = await request(app)
            .post("/api/governance/proposal/p2/execute")
            .send({});

        expect(r.status).toBe(403);
        expect(r.body.reason).toBe("DENY_POLICY");
    });

});
