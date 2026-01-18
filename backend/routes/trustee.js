router.post("/mfa/verify", async (req, res) => {
    const { code, challenge, pqcSig } = req.body;

    const validSig = PQCMFA.verifyMFAPacket({ code, challenge }, pqcSig);
    if (!validSig) return res.json({ valid: false });

    const mfaOK = await TrusteeMFA.verifyMFA(req.user, code);
    const challengeOK = ChallengeGenerator.validate(req.user, challenge);

    res.json({ valid: mfaOK && challengeOK });
});
