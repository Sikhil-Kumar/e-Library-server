const express = require('express')

const Admin = require('../models/ServiceProvider')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = "You are a good boy heheheh"
const fetchadmin = require('../middleware/fetchAdmin')
const Product = require('../models/Product');

const { query, matchedData, body, validationResult } = require('express-validator');



//route 1
//create user
router.post('/createAdmin', [

    body('name', "Enter a valid name(length > 3)").isLength({ min: 3 }),
    body('email', "Enter a valid and unique email").isEmail(),
    body('password', "Password length should be more than 5").isLength({ min: 5 }),

], async (req, res) => {

    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let admin = await Admin.findOne({ email: req.body.email })
    if (admin) {
        return res.status(400).json({ error: "Sorry a user with this email already exists" })
    }

    const salt = await bcrypt.genSalt(10)
    const securePassword = await bcrypt.hash(req.body.password, salt)

    admin = await Admin.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
    })
    const data = {
        admin: {
            id: admin.id
        }
    }

    var token = jwt.sign(data, JWT_SECRET);

    res.json({ token })

})

//router 2
//authenticate the user (login)

router.post('/login', [

    body('email', "Enter a valid and unique email").isEmail(),
    body('password', "Password cannot be blank").exists(),

], async (req, res) => {

    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body
    try {
        let admin = await Admin.findOne({ email })

        if (!admin) {
            return res.status(400).json({ error: "Student not registered" })

        }
        const passwordCompare = await bcrypt.compare(password, admin.password)

        if (!passwordCompare) {
            return res.status(400).json({ error: "Please Try logging in with the correct credentials" })

        }
        const data = {
            admin: {
                id: admin.id
            }
        }

        let token = jwt.sign(data, JWT_SECRET)
        res.json({ token })

    } catch (error) {
        console.log(error);
    }
}
)

//router 3
//Get user data

router.get('/getAdmin', fetchadmin, async (req, res) => {

    try {

        const adminId = req.admin.id

        const admin = await Admin.findById(adminId).select('-password')
        res.send(admin)
    } catch (error) {
        console.log(error);
    }
})

// // Initialize product with initial quantities
// router.post('/initializeProduct', fetchadmin, async (req, res) => {
//     try {
//         const { crane, pulley, ballbearings, grease } = req.body;

//         const product = new Product({
//             crane,
//             pulley,
//             ballbearings,
//             grease
//         });

//         await product.save();
//         res.json(product);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal server error");
//     }
// });

// // Set max quantities for the products
// router.put('/setMaxQuantities', fetchadmin, async (req, res) => {
//     try {
//         const { crane, pulley, ballbearings, grease } = req.body;

//         let product = await Product.findOne();
//         if (!product) {
//             return res.status(404).send("Product not found");
//         }

//         // product.crane = crane;
//         // product.pulley = pulley;
//         // product.ballbearings = ballbearings;
//         // product.grease = grease;

//         if (crane !== undefined) product.crane = crane;
//         if (pulley !== undefined) product.pulley = pulley;
//         if (ballbearings !== undefined) product.ballbearings = ballbearings;
//         if (grease !== undefined) product.grease = grease;

//         await product.save();
//         res.json(product);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal server error");
//     }
// });


module.exports = router