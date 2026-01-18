/**
 * SPQ — Sovereign Priority Queue
 */

const queue = [];

module.exports = {
    push(urd) {
        queue.unshift(urd); // high-priority at top
    },

    next() {
        return queue.shift() || null;
    },

    size() {
        return queue.length;
    }
};
