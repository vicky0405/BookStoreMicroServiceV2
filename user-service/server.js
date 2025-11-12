const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mount user & auth endpoints
app.use("/api/auth", require("./routes/AuthRoutes"));
app.use("/api/users", require("./routes/UserRoutes"));

// optional: health + verify token endpoint
app.get("/health", (req, res) => res.json({ ok: true }));
// nếu muốn expose verify endpoint thay vì share secret

app.listen(PORT, () => console.log(`User service running on ` + PORT));
