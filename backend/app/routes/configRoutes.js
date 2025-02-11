const express = require("express");

const router = express.Router();
const CGPA_THRESHOLD = 700; 

router.get("/", (req, res) => {
  res.json({ threshold: CGPA_THRESHOLD });
});

module.exports = router;
