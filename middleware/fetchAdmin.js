const jwt = require('jsonwebtoken')

const JWT_SECRET = "You are a good boy heheheh"

const fetchadmin = (req, res, next) => {
    //Get the user from the jwt token and add id to req object
    const token = req.header('auth-token')

    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" })
    }

    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.admin = data.admin
        next()

    } catch (error) {
        console.log(error);
        return res.status(401).json({ error: "Invalid token" });
    }

}

module.exports = fetchadmin;