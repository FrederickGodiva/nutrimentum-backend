import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
    res.status(200).send({
        "message": "Hello user",
    })
})

export default router;