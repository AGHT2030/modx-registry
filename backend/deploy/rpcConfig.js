/**
 * Auto-Fallback RPC Configuration
 * Priority order:
 *   1. Private RPC
 *   2. Alchemy
 *   3. QuickNode
 *   4. Public RPC
 */

module.exports = [
    process.env.PRIVATE_RPC || null,
    process.env.ALCHEMY_POLYGON_RPC || null,
    process.env.QUICKNODE_POLYGON_RPC || null,
    "https://polygon-rpc.com"
].filter(Boolean);
