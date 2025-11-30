const internalAuth = (req, res, next) => {
    const apiKey = req.headers['x-internal-api-key'];
    if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: "Unauthorized access.",
        });
    }
};

module.exports = { internalAuth };