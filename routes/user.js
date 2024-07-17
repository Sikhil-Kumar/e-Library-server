const express = require('express')

const User = require('../models/User')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchstudent = require('../middleware/fetchstudent')
const JWT_SECRET = "You are a good boy"
const Product=require('../models/Product')

const { query, matchedData, body, validationResult } = require('express-validator');





//route 1
//create user
router.post('/createuser', [

    body('name', "Enter a valid name(length > 3)").isLength({ min: 3 }),
    body('email', "Enter a valid and unique email").isEmail(),
    body('password', "Password length should be more than 5").isLength({ min: 5 }),

], async (req, res) => {

    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let user = await User.findOne({ email: req.body.email })
    if (user) {
        return res.status(400).json({ error: "Sorry a user with this email already exists" })
    }

    const salt = await bcrypt.genSalt(10)
    const securePassword = await bcrypt.hash(req.body.password, salt)


    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
      
    })
    const data = {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
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
        let user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ error: "Student not registered" })

        }
        const passwordCompare = await bcrypt.compare(password, user.password)

        if (!passwordCompare) {
            return res.status(400).json({ error: "Please Try logging in with the correct credentials" })

        }
        const data = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
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

router.get('/getUser', fetchstudent, async (req, res) => {

    try {

        const userId = req.user.id

        const user = await User.findById(userId).select('-password')

        res.send(user)
    } catch (error) {
        console.log(error);
    }
})

router.get('/getAllUsers', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/productQuantities', async (req, res) => {
    try {
        const product = await Product.findOne();
        if (!product) {
            return res.status(404).send("Product not found");
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});



module.exports = router