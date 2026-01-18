const SIT = require("../../deployments/polygon/SIT_SovereignIdentity.json");
const ABI = require("../../abi/SIT_ABI.json");
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
const contract = new ethers.Contract(SIT.address, ABI, provider);

module.exports = {
    async isRegistered(addr) {
        return await contract.isRegistered(addr);
    },

    async loadIdentity(addr) {
        return await contract.identities(addr);
    }
};
