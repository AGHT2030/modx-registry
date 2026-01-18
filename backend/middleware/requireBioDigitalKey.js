module.exports = function (req, res, next) {
    const key = req.headers["x-bio-key"];

    if (!key || key !== process.env.BIO_DIGITAL_KEY) {
        return res.status(403).json({
            status: "BIO_KEY_REQUIRED",
            message: "Bio-digital key validation failed."
        });
    }

    next();
};
