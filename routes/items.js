const express = require('express');
const fetchAdmin = require('../middleware/fetchAdmin');
const Item = require('../models/Items');
const router = express.Router();

router.post('/add',  async (req, res) => {
    try {
        const { items } = req.body;

        if (typeof items !== 'object' || !items) {
            return res.status(400).send("Invalid items object");
        }

        // Fetch the single item document
        let itemDoc = await Item.findOne();

        if (!itemDoc) {
            itemDoc = new Item({ items: new Map() });
        }

        // Update items
        for (const [key, value] of Object.entries(items)) {
            if (typeof value !== 'number' || value < 0) {
                return res.status(400).send("Invalid quantity for item: " + key);
            }
            if (itemDoc.items.has(key)) {
                itemDoc.items.set(key, itemDoc.items.get(key) + value);
            } else {
                itemDoc.items.set(key, value);
            }
        }

        await itemDoc.save();
        res.json(itemDoc);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

// Route to get all items
router.get('/all', async (req, res) => {
    try {
        let itemDoc = await Item.findOne();

        if (!itemDoc) {
            return res.status(404).send("Items not found");
        }

        res.json(itemDoc.items);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

// Route to remove specified quantity of items
router.post('/remove', async (req, res) => {
    try {
        const { items } = req.body;

        if (typeof items !== 'object' || !items) {
            return res.status(400).send("Invalid items object");
        }

        // Fetch the single item document
        let itemDoc = await Item.findOne();

        if (!itemDoc) {
            return res.status(404).send("Items not found");
        }

        // Update items
        for (const [key, value] of Object.entries(items)) {
            if (typeof value !== 'number' || value < 0) {
                return res.status(400).send("Invalid quantity for item: " + key);
            }
            if (itemDoc.items.has(key)) {
                let currentQuantity = itemDoc.items.get(key);
                if (currentQuantity < value) {
                    return res.status(400).send(`Cannot remove more items than available for: ${key}`);
                }
                // itemDoc.items.set(key, currentQuantity - value);


                let newQuantity = currentQuantity - value;
                if (newQuantity === 0) {
                    itemDoc.items.delete(key);
                } else {
                    itemDoc.items.set(key, newQuantity);
                }
            } else {
                return res.status(400).send(`Item not found: ${key}`);
            }
        }

        await itemDoc.save();
        res.json(itemDoc);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
