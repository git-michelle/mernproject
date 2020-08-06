const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const {
    check,
    validationResult
} = require("express-validator");
//more info https://express-validator.github.io/docs/

const User = require("../../models/User");

// @route           POST api/users
// @description     Register user
// @access          Public
router.post('/', [
        check("name", "Your name is required").not().isEmpty(),
        check("email", "Please use a valid email").isEmail(),
        check("password", "Please enter password with 8 or more characters").isLength({
            min: 8
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            name,
            email,
            password
        } = req.body;

        try {
            //check if user already exists
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: "User already exists"
                    }]
                });
            }
            //get user gravatar
            const avatar = gravatar.url(email, {
                s: "200",
                r: "pg",
                d: "retro"
            });

            user = new User({
                name,
                email,
                avatar,
                password
            });
            // encrypt pw using bcrypt and then save user

            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

            // return jsonwebtoken, needed to log user in upon registration 

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