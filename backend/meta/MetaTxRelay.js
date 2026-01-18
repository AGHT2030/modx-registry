/**
 * Meta Transaction Relay
 * • Trustees + Investors may execute trades gaslessly
 * • Relayer signs + sends the transaction
 */

const { ethers } = require("ethers");
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

module.exports = {
    async executeMetaTx(target, data, user) {
        const tx = await wallet.sendTransaction({
            to: target,
            data
        });

        console.log(`⚡ Gasless MetaTX executed for ${user.email}`);
        return await tx.wait();
    }
};
