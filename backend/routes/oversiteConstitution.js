/**
 * Oversite Constitution API Router
 */

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const DECLARATION = path.join(__dirname, "../../governance/declaration.txt");
const CONSTITUTION = path.join(__dirname, "../../governance/constitution.txt");
const AMENDMENTS = path.join(__dirname, "../../governance/amendments.json");
const INTEGRITY = path.join(__dirname, "../../sentinel/integrity.json");

router.get("/declaration", (req, res) => {
    return res.json({ text: fs.readFileSync(DECLARATION, "utf8") });
});

router.get("/main", (req, res) => {
    return res.json({ text: fs.readFileSync(CONSTITUTION, "utf8") });
});

router.get("/amendments", (req, res) => {
    const raw = fs.readFileSync(AMENDMENTS, "utf8");
    return res.json(JSON.parse(raw || "{}"));
});

router.get("/integrity", (req, res) => {
    const raw = fs.readFileSync(INTEGRITY, "utf8");
    return res.json(JSON.parse(raw || "{}"));
});

module.exports = router;
