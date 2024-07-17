const jwt = require('jsonwebtoken');
const JWT_SECRET = "You are a good boy"

const fetchstudent = (req, res, next) => {
    //Get the user from the jwt token and add id to req object

    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" })
    }

    try {

        const data = jwt.verify(token, JWT_SECRET)

        req.user = data.user

        next()

    } catch (error) {
        console.log(error);
        return res.status(401).json({ error: error });
    }

}

module.exports = fetchstudent;