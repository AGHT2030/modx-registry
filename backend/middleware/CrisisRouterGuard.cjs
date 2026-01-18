/**
 * CrisisRouterGuard — ensures highest privilege for crisis operations
 */

module.exports = function CrisisRouterGuard(req, res, next) {
    const role = req.user?.role;

    const allowed = [
        "AGH_TRUSTEE",
        "BLC_ADMIN",
        "COINPURSE_SYSADMIN",
        "admin"
    ];

    if (!allowed.includes(role)) {
        global.UNAUTH_COUNT = (global.UNAUTH_COUNT || 0) + 1;

        return res.status(403).json({
            error: "Insufficient privileges for crisis operations.",
            status: "UNAUTHORIZED"
        });
    }

    // If system is in hard lockdown, allow only trustees
    if (global.LOCKDOWN && role !== "AGH_TRUSTEE") {
        return res.status(423).json({
            error: "System is in lockdown mode.",
            status: "LOCKDOWN_ACTIVE"
        });
    }

    return next();
};
