
/**
 * © 2025 AG Holdings Trust | MODX Sovereign Technologies
 * ALL RIGHTS RESERVED — UNLICENSED
 * 
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or
 * derivative creation is STRICTLY PROHIBITED.
 *
 * Protected under USPTO application filings for:
 *  - MODX Orbital OS
 *  - MODA/MODX Digital Constitution
 *  - AURA AI Systems
 *  - PQC Identity Rail
 *  - Quantum Governance Engine
 *  - CoinPurse Financial Layer
 *
 * Any tampering triggers MODX Quantum Sentinel.
 */

/**
 * © 2025 Mia Lopez | AG Holdings / MODAStay / MODE / CoinPurse
 * Swagger Loader — Franchise Admin API Documentation
 */

const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

function loadSwaggerSpec() {
    try {
        const file = path.join(__dirname, "swagger.json");
        const json = JSON.parse(fs.readFileSync(file, "utf8"));
        return json;
    } catch (err) {
        console.error("❌ Swagger spec load failed:", err);
        return {
            openapi: "3.0.0",
            info: { title: "MODAStay API", version: "0.0.1" },
        };
    }
}

module.exports = function swaggerDocs(app) {
    const spec = loadSwaggerSpec();
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
    console.log("📘 Swagger Docs mounted at /docs");
};
