const express = require("express");
const honeypot = require("../middleware/honeypot");
const validateContact = require("../middleware/validation");
const { handleContact } = require("../controllers/contactController");

const router = express.Router();

router.post("/", honeypot, validateContact, handleContact);

module.exports = router;
