
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
 * © 2025 AG Holdings | INTI Token Issuance (Full Flow)
 * Creates trustline (if missing) and issues 5,000,000 INTI from issuer to INTI wallet
 */

const xrpl = require("xrpl");

const NODE = "wss://xrplcluster.com";

// 🔐 Replace with your actual secrets and addresses
const ISSUER_SEED = "sEd7supCRs3hJZ5uhXuKhoGfDaX8D4n"; // MODUSD/INTI issuer seed
const ISSUER_ADDR = "rUKJEfqXsweRebXrRB1NWJxjy34QracLVX";
const INTI_SEED = "sEdTwBmQ5iCf2ypZ39YMnnvWiVgMuE6"; // receiver wallet seed
const INTI_ADDR = "rNNNUMzaxDubY8goh6DnVnyXqWUpeRZ121";

// Token details
const TOKEN_CODE = "INTI";
const TOKEN_HEX = Buffer.from(TOKEN_CODE, "ascii")
    .toString("hex")
    .padEnd(40, "0")
    .toUpperCase();
const TOKEN_AMOUNT = "5000000"; // number of INTI tokens to issue

async function main() {
    const client = new xrpl.Client(NODE);
    await client.connect();
    console.log(`✅ Connected to XRPL: ${NODE}`);

    // -----------------------
    // 1️⃣ Ensure trustline exists
    // -----------------------
    const trustWallet = xrpl.Wallet.fromSeed(INTI_SEED);
    const trustTx = {
        TransactionType: "TrustSet",
        Account: INTI_ADDR,
        LimitAmount: {
            currency: TOKEN_HEX,
            issuer: ISSUER_ADDR,
            value: TOKEN_AMOUNT,
        },
    };

    const preparedTrust = await client.autofill(trustTx);
    const signedTrust = trustWallet.sign(preparedTrust);
    const trustResult = await client.submitAndWait(signedTrust.tx_blob);
    console.log(`📜 INTI TrustLine Result: ${trustResult.result.meta.TransactionResult}`);

    // -----------------------
    // 2️⃣ Issue INTI tokens
    // -----------------------
    console.log(`💠 Issuing ${TOKEN_AMOUNT} INTI to INTI wallet...`);

    const issuerWallet = xrpl.Wallet.fromSeed(ISSUER_SEED);
    const issueTx = {
        TransactionType: "Payment",
        Account: ISSUER_ADDR,
        Amount: {
            currency: TOKEN_HEX,
            issuer: ISSUER_ADDR,
            value: TOKEN_AMOUNT,
        },
        Destination: INTI_ADDR,
    };

    const preparedIssue = await client.autofill(issueTx);
    const signedIssue = issuerWallet.sign(preparedIssue);
    const issueResult = await client.submitAndWait(signedIssue.tx_blob);

    console.log(`📤 INTI Issuance Result: ${issueResult.result.meta.TransactionResult}`);
    await client.disconnect();
}

main().catch(console.error);
