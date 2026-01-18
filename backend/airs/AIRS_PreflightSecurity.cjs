/**
 * © 2025 AG Holdings Trust | AIRS Preflight Security Suite
 * PINMYFIVE • Driver Validation • Sentinel Threat Scan
 */

const { TwinOracle } = require("../core/twins/TwinOracle.cjs");
const { rotateCode, getActiveCode } = require("./AIRS_SafeZoneRegistry.cjs");

function validatePIN(inputPIN) {
    return inputPIN === getActiveCode();
}

function validateDriver(driverRecord) {
    return (
        driverRecord &&
        driverRecord.backgroundCheck === "pass" &&
        driverRecord.identityVerified === true
    );
}

function preflightCheck({ pin, driver, vehicle, twinProfile }) {
    const isPINvalid = validatePIN(pin);
    const isDriverValid = validateDriver(driver);

    const risk = TwinOracle.riskWeight(twinProfile);

    return {
        ready:
            isPINvalid &&
            isDriverValid &&
            vehicle?.autonomous === true &&
            risk < 0.8,
        checks: {
            pin: isPINvalid,
            driver: isDriverValid,
            vehicleAutonomous: vehicle?.autonomous === true,
            riskScore: risk
        }
    };
}

module.exports = { preflightCheck, validatePIN, validateDriver };
