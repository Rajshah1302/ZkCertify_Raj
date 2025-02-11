const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const verifyRoutes = require("../routes/verifyRoutes");
const historyRoutes = require("../routes/historyRoutes");
const configRoutes = require("../routes/configRoutes");

const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000", 
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use("/verify", verifyRoutes);
app.use("/verifications", historyRoutes);
app.use("/threshold", configRoutes);

app.listen(PORT, () => {
  console.log(`ZkCertify server running on port ${PORT}`);
});
