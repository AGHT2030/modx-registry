const xrpl = require("xrpl");

module.exports = async function anchorDigest(digest) {
    const client = new xrpl.Client(process.env.XRPL_RPC);
    await client.connect();

    const wallet = xrpl.Wallet.fromSeed(process.env.XRPL_ANCHOR_SEED);

    const tx = {
        TransactionType: "Payment",
        Account: wallet.classicAddress,
        Destination: wallet.classicAddress,
        Amount: "1",
        Memos: [
            {
                Memo: {
                    MemoData: Buffer.from(digest).toString("hex")
                }
            }
        ]
    };

    const result = await client.submitAndWait(tx, { wallet });
    await client.disconnect();
    return result.hash;
};
