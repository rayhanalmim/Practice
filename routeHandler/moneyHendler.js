const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
 
const Money = require("../schemas/moneySchemas.js");
const { ObjectId } = require("mongodb");

 
router.get("/", async (req, res) => {
  try {
    const costs = await Money.find();
    res.send(costs);
  } catch (error) {
    console.error("Error fetching costs:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.get("/singleShop", async (req, res) => {
  try {
    const id = req.query.id;
    const costs = await Money.findOne({_id: new ObjectId(id)});
    res.send(costs);
  } catch (error) {
    console.error("Error fetching costs:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.put("/updateShop", async (req, res) => {
  try {
    const id = req.query.id;
    const updateShop = await Money.updateOne({ _id: id }, { $set: req.body });
    res.send(updateShop);
  } catch (error) {
    console.error("Error fetching costs:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const costData = req.body;
    const newCost = await Money.create(costData);
    res.status(201).send(newCost);
  } catch (error) {
    console.error("Error creating cost:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const costId = req.params.id;
    const deletedProduct = await Money.deleteOne({ _id: costId });

    res.status(200).json({
      message: "Cost deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
