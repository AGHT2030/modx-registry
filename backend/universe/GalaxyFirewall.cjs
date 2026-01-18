/**
 * Galaxy Firewall — isolates galaxies based on localized threat conditions.
 * Protects: PLAY, SHOP, INVEST, MOVE, BUILD, GROW, MODE, STAY, AIRS, CREATV
 */

module.exports = {
    state: {
        PLAY: false,
        SHOP: false,
        INVEST: false,
        MOVE: false,
        BUILD: false,
        GROW: false,
        STAY: false,
        MODE: false,
        AIRS: false,
        CREATV: false,
    },

    isolate(galaxy, reason) {
        this.state[galaxy] = true;

        global.IO.emit("galaxy:firewall", {
            galaxy,
            active: true,
            reason
        });

        console.warn(`🛑 Galaxy Firewall ACTIVE → ${galaxy}: ${reason}`);
    },

    restore(galaxy) {
        this.state[galaxy] = false;

        global.IO.emit("galaxy:firewall", {
            galaxy,
            active: false,
        });

        console.log(`🟢 Galaxy Firewall RESTORED → ${galaxy}`);
    },

    isBlocked(galaxy) {
        return !!this.state[galaxy];
    }
};
