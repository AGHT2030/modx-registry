/**
 * WrapUp™ Vendor Intake Service
 */

module.exports = {
    async intakeVendor(req, res) {
        const data = {
            vendorId: "V-" + Date.now(),
            status: "intake_received",
            insuranceRequired: true,
            directions: "/vendor/map",
            video: "/ari/welcome-vendor.mp4"
        };
        res.json(data);
    },

    async getVendorMaps(req, res) {
        const { vendorId } = req.params;
        res.json({
            vendorId,
            loadInMap: "/maps/load-in.png",
            venueLayout: "/maps/venue-layout.png"
        });
    }
};
