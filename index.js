const app = require("./app.js");

app.get("/", (req, res) => {
    res.send("This is  Api")
})

app.listen(process.env.PORT, () =>
    console.log("Server running" + process.env.PORT)
);
