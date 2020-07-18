const express = require("express");

//calling the constructor
const app = express();

//middleware
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("Payfast"));

//define routes

app.use("/api/payfast", require("./routes/api/payfast"));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server on ${PORT}`));
