	const express = require("express");
	const router = express.Router();
	const bcrypt = require("bcryptjs");
	const auth = require("../../middleware/auth");
	const jwt = require("jsonwebtoken");
	const config = require("config");
	const User = require("../../models/User");



	const {
	    check,
	    validationResult
	} = require("express-validator");


	// @route           GET api/auth	
	// @description     Test route	
	// @access          Public	


	router.get("/", auth, async (req, res) => {
	    try {
	        const user = await User.findById(req.user.id).select('-password'); //-password to leave it out
	        res.json(user);
	    } catch (err) {
	        console.error(err.message);
	        res.status(500).send('Server Error');
	    }
	});

	// @route           POST api/auth
	// @description     Authenticate existing user and get token
	// @access          Public
	router.post('/', [

	        check("email", "Please use a valid email").isEmail(),
	        check("password", "Password is required").exists()
	    ],
	    async (req, res) => {
	        const errors = validationResult(req);
	        if (!errors.isEmpty()) {
	            return res.status(400).json({
	                errors: errors.array()
	            });
	        }

	        const {
	            email,
	            password
	        } = req.body;

	        try {
	            //check if user already exists
	            let user = await User.findOne({
	                email
	            });
	            if (!user) {
	                return res.status(400).json({
	                    errors: [{
	                        msg: "Invalid credentials. Check your login information."
	                    }]
	                });
	            }

	            const isMatch = await bcrypt.compare(password, user.password); //1st param plaintext pw and 2nd param is encypted pw saved to user object

	            if (!isMatch) {
	                return res.status(400).json({
	                    errors: [{
	                        msg: "Invalid credentials. Check your login information."
	                    }]
	                });
	            }

	            // return jsonwebtoken, needed to log user in 
	            const payload = {
	                user: {
	                    id: user.id
	                }
	            }

	            jwt.sign(payload,
	                config.get("jwtSecret"), {
	                    expiresIn: 360000
	                },
	                (err, token) => {
	                    if (err) throw err;
	                    res.json({
	                        token
	                    });
	                }
	            );

	        } catch (err) {
	            console.error(err.message);
	            res.status(500).send("Server error");
	        }


	    });

	module.exports = router;