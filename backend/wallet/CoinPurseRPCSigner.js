// © 2025 AIMAL Global Holdings | CoinPurse Sovereign Wallet RPC Signer
// UNLICENSED — Proprietary

const axios = require("axios");
const { ethers } = require("ethers");

class CoinPurseRPCSigner extends ethers.Signer {
    constructor(rpcUrl, address) {
        super();
        this.rpcUrl = rpcUrl;
        this.address = address;
    }

    async getAddress() {
        return this.address;
    }

    async signTransaction(tx) {
        const payload = {
            sender: this.address,
            tx
        };

        const res = await axios.post(
            `${this.rpcUrl}/sign/deploy`,
            payload,
            { timeout: 15000 }
        );

        if (!res.data || !res.data.signedTx) {
            throw new Error("CoinPurse RPC failed to sign transaction");
        }

        return res.data.signedTx;
    }

    connect(provider) {
        const next = new CoinPurseRPCSigner(this.rpcUrl, this.address);
        next.provider = provider;
        return next;
    }
}

module.exports = CoinPurseRPCSigner;
