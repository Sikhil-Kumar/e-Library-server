const express = require('express');
const router = express.Router();
const SelectedItem = require('../models/SelectedItemSchema');
const fetchstudent = require('../middleware/fetchstudent');
const Item = require('../models/Items')


router.post('/selected-items/add', fetchstudent, async (req, res) => {
  const { item, quantity } = req.body;

  try {
      // Find the item by searching within the items map
      const itemsDocument = await Item.findOne({ "items": { $exists: true } });
      
      if (!itemsDocument || !itemsDocument.items.has(item)) {
          console.log('Original item not found');
          return res.status(400).json({ error: 'Item not found' });
      }

      const originalQuantity = itemsDocument.items.get(item);

      if (originalQuantity < quantity) {
          return res.status(400).json({ error: 'Insufficient stock available' });
      }

      let selectedItem = await SelectedItem.findOne({ user: req.user.id, item });

      if (selectedItem) {
          if (selectedItem.quantity + quantity > originalQuantity) {
              return res.status(400).json({ error: 'Total selected quantity exceeds available stock' });
          }
          selectedItem.quantity += quantity;
          await selectedItem.save();
      } else {
          selectedItem = new SelectedItem({
              user: req.user.id,
              item,
              quantity
          });
          await selectedItem.save();
      }

      // Reduce the quantity of the item in the items map
    //   itemsDocument.items.set(item, originalQuantity - quantity);
    //   await itemsDocument.save();

      const updatedItems = await SelectedItem.find({ user: req.user.id });
      res.json(updatedItems);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
  }
});


router.post('/selected-items/remove', fetchstudent, async (req, res) => {
  const { item, quantity } = req.body;

  try {
      // Find the selected item for the user
      const selectedItem = await SelectedItem.findOne({ user: req.user.id, item });

      if (!selectedItem) {
          return res.status(404).json({ error: 'Selected item not found' });
      }

      if (selectedItem.quantity < quantity) {
          return res.status(400).json({ error: 'Cannot remove more items than available' });
      }

      // Update the quantity of the selected item
      selectedItem.quantity -= quantity;

      if (selectedItem.quantity <= 0) {
          await SelectedItem.deleteOne({ _id: selectedItem._id });
      } else {
          await selectedItem.save();
      }

      // Find the items document to update the quantity in the items map
    //   const itemsDocument = await Item.findOne({ "items": { $exists: true } });

    //   if (!itemsDocument || !itemsDocument.items.has(item)) {
    //       return res.status(400).json({ error: 'Original item not found in items collection' });
    //   }

      // Update the original item's quantity in the items map
    //   const originalQuantity = itemsDocument.items.get(item);
    //   console.log(originalQuantity);
    //   itemsDocument.items.set(item, originalQuantity + quantity);
    //   await itemsDocument.save();

      const updatedItems = await SelectedItem.find({ user: req.user.id });
      res.json(updatedItems);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
  }
});


// Route to get all selected items for a user
router.get('/selected-items/getallItems',fetchstudent, async (req, res) => {
    const userId =  req.user.id;

    try {
        const selectedItems = await SelectedItem.find({ user: userId });

        res.json(selectedItems);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
