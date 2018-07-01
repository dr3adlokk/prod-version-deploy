const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const models = require('../../models')

//input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

//user model
const User = require('../../models/usermodel/User')

router.get('/test', (req, res) => res.json({msg:"Auth Works"}))

router.post('/register', (req, res)=> {
    const { errors, isValid } = validateRegisterInput(req.body)
})

//check validation
if (!isValid) {
    return res.status(400).json(errors)
}

User.findOne({ email: req.body.email }).then(user => {
    if (user) {
        errors.email = 'Email Already Exists...';
        return res.status(400).json(errors);

    } else {
    
    }
})

const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
})

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash))
    if (err) throw err;
    newUser.password = hash;
    newUser 
    .save()
    .then(user => res.json(user))
    .catch(err => console.log(err))

})


// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post('login', (req, res)=> {
    const { errors, isValid } = validateLoginInput(req.body)
})

//validate 
if (!isValid){
    return res.status(400).json(errors)

}
const email = req.body.email;
const password = req.body.password;

//find user's email
User.findOne({email}).then(user => {
    //check db for user
    if(!user){ 
        errors.email = 'User Not Found...'
        return res.status(404).json(errors)

    }
//check password
bcrypt.compare(password, user.password).then(isMatch => {
    if (isMatch) {
        //user matched
        const payload = { id: user.id, name: user.name, }
        

        //Sign Token
        jwt.sign(
            payload, models.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
                res.json({
                    success: true,
                    token: 'Bearer' + token

                });
            }
        )

    } else {
        errors.password = 'Password Incorrect...';
        return res.status(400).json(errors)

    }
})

})


router.get(
    '/current', 
    passport.authenticate('jwt', { session: false }), (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        })
    })
module.exports = router;
// router.post('/register', (req, res)=> {
//     User.findone({
//         email: req.body.email
//     }).then(user => {
//         if (user) {
//             return res.status(400).json({email: 'Email already Exists...'})
//         } else {
//             const newUser = new User({
//                 name: req.body.name,
//                 email: req.body.email,
//                 password: req.body.password

//             })

//             bcrypt.genSalt(10, (err, salt)=> {
//                 bcrypt.hash(newUser.password, salt, (err, hash)=> {
//                      if (err) throw err;
//                      newUser.password = hash;
//                      newUser
//                      .save()
//                      .then(user => res.json(user))
//                      .catch(err => console.log(err))

//                 })
               
//             })
//         }
//     })
// })

