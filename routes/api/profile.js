const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const {
    check,
    validationResult
} = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route           GET api/profile/me
// @description     Get current user's profile
// @access          Private since its from the token and needs auth middleware
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate("user", ["name", "avatar"]);

        if (!profile) {
            return res.status(400).json({
                msg: "There is no profile for this user"
            });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});

// @route           POST api/profile
// @description     Create / update a user profile
// @access          Private since its from the token and needs auth middleware
router.post("/",
    [auth,
        [check("status", "Status is required").not().isEmpty(),
            check("skills", "Skills is required").not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            linkedin,
            instagram
        } = req.body;

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        //turn user comma separated list into array and trim any spaces
        if (skills) {
            profileFields.skills = skills.split(",").map(skills => skills.trim())
        }
        //build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            //user is the object id and the req.user.id is from the token
            let profile = await Profile.findOne({
                user: req.user.id
            })

            // see if profile exists
            if (profile) {
                //Update
                profile = await Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                });

                return res.json(profile);
            }

            // if not profile, create one and save it
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);


        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error")
        }

    });

// @route           GET api/profile
// @description     Get ALL user profiles
// @access          Public


router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate("user", ["name", "avatar"]);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error")
    }
});

// @route           GET api/profile/user/:user_id
// @description     Get profile by user ID
// @access          Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate("user", ["name", "avatar"]);

        if (!profile) return res.status(400).json({
            msg: "This profile was not found."
        });

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == "ObjectId") {
            return res.status(400).json({
                msg: "Profile not found."
            });
        }
        res.status(500).send("Server error")
    }
});

// @route           DELETE api/profile
// @description     Delete profile, user, and their posts
// @access          Private

router.delete('/', auth, async (req, res) => {
    try {
        //remove profile, user
        await Profile.findOneAndRemove({
            user: req.user.id
        });
        await User.findOneAndRemove({
            _id: req.user.id
        });

        res.json({
            msg: "User and profile deleted"
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind == "ObjectId") {
            return res.status(400).json({
                msg: "Profile not found."
            });
        }
        res.status(500).send("Server error")
    }
});

module.exports = router;