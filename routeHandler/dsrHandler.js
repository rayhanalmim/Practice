const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dsrRequest = require("../schemas/dsrSchema");
const Product = require("../schemas/productSchemas");
const userCollection = require("../schemas/userSchemas");
const moneyInfo = require("../schemas/moneySchemas");
const cardCollection = require("../schemas/cardSchema");
const { ObjectId } = require("mongodb");

router.get("/", async (req, res) => {
    const requestedData = await dsrRequest.find({
        $or: [
          { orderStatus: "pending" },
          { orderStatus: "acceptdue" }
        ]
      });
    res.send(requestedData)
});

router.get("/OrderNo", async (req, res) => {
    const requestedData = await dsrRequest.find(
          { orderStatus: "Completed" }
      );
    res.send(requestedData)
});

router.get("/orderStatus", async (req, res) => {
    const email = req.query.email;
    const requestedData = await dsrRequest.find({"dsrInfo.email": email},{orderNo: 1, orderDate: 1, orderTime: 1, orderStatus: 1, _id: 0 });
    res.send(requestedData)
});

router.get("/findOne", async (req, res) => {
    const reqId = req.query.reqId;
    const requestedData = await dsrRequest.findById(reqId);
    res.send(requestedData)
});

router.get("/UpdateOne", async (req, res) => {
    const {reqId, orderNo} = req.query;
    const requestedData = await dsrRequest.findById(reqId);

    if(!requestedData.orderNo){
        const update = await dsrRequest.updateOne(
            { _id: reqId },
            {
                $set: {
                    orderNo: orderNo,
                },
            },
            { upsert: true } // Create a new document if it doesn't exist
        );
         return res.send(update)
    }

    res.send("")
});

router.post("/reject", async (req, res) => {
    const reqId = req.query.reqId;

    const update = await dsrRequest.updateOne(
        { _id: new ObjectId(reqId) },
        {
            $set: {
                orderStatus: "reject",
                requestedItems: []
            },
        }
    );
    res.send(update)
});

router.post("/acceptDue", async (req, res) => {
    const products = req.body;
    const reqId = req.query.reqId;

    for (const product of products) {
        const { ID, quantity } = product;

        const update = await dsrRequest.updateOne(
            { 
                _id: new ObjectId(reqId), 
                "requestedItems.ID": ID // Match the product ID within the requestedItems array
            },
            {
                $set: {
                    "requestedItems.$.productQuentity": quantity,
                },
            }
        )
        console.log(update);;  
    }

    const update = await dsrRequest.updateOne(
        { _id: new ObjectId(reqId) },
        {
            $set: {
                orderStatus: "acceptdue",
            },
        }
    );


    res.send("update")
});

router.post("/", async (req, res) => {
    const { dsrEmail, shopId } = req.query;
    const utcPlus6Date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const currentTimeDhaka = new Date(utcPlus6Date).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' });
    const date = new Date().toISOString().substring(0, 10);

    const shop = await moneyInfo.findOne({_id: shopId});
    const dsr = await userCollection.findOne({ email: dsrEmail});
    const requestedData = await cardCollection.findOne({ user: dsrEmail });
    const obj = {
        dsrInfo: dsr,
        orderDate: date, 
        orderTime: currentTimeDhaka,
        orderStatus: "pending",
        shopInfo: shop,
        requestedItems: requestedData.cardItems,
    }

    const clearCardData = await cardCollection.deleteOne({ user: dsrEmail });
    const push = await dsrRequest.create(obj);

    res.status(200).send({message: "Request send successfully"});
});

router.get("/order", async (req, res) => {
    const utcPlus6Date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const currentTimeDhaka = new Date(utcPlus6Date).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' });
    const date = new Date().toISOString().substring(0, 10);
    const data = {
        date: date,
        time: currentTimeDhaka
    }
    res.send(data)
});

router.get("/searchProduct", async (req, res) => {
    const searchQuery = req.query.searchText;
    const regex = new RegExp(searchQuery, 'i');

    const products = await Product.find({ productQuantity: { $gt: 0 } });

    const filteredResults = products.filter((product) => regex.test(product.productName));

    filteredResults.sort((a, b) => a.productName.localeCompare(b.productName));

    res.send(filteredResults)
});

router.get("/shop", async (req, res) => {
    // const searchQuery = req.query.searchText;
    const { dsrEmail } = req.query;

    const dsr = await userCollection.findOne({ email: dsrEmail});

    const regex = new RegExp(dsr.ifDsrArea, 'i');

    const shops = await moneyInfo.find();

    const filteredResults = shops.filter((product) => regex.test(product.shopArea));

    filteredResults.sort((a, b) => a.shopArea.localeCompare(b.shopArea));

    res.send(filteredResults)
});



module.exports = router;