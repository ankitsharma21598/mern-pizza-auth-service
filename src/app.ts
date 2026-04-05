import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to the Pizza App!");
});

export default app;
