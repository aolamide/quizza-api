import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import expressJwt from 'express-jwt';
import User from '../models/user';
import crypto from 'crypto';
import sendMail from '../helpers/mail/resetMail';
import sendVerifyMail from '../helpers/mail/verifyMail';

dotenv.config();

const signUp = (req, res) => {
    User.findOne({email : req.body.email}, (err, user)=> {
        if(err || !user){
            delete req.body.isAdmin;
            delete req.body.isVerified;
            req.body.emailVerifyToken = crypto.randomBytes(20).toString('hex');
            const newUser = new User(req.body);
            newUser.save((error, saved) => {
                if(error) return res.status(403).json({error})
                else if(saved) {
                    sendVerifyMail(saved.email, saved.emailVerifyToken, saved.name.split(' ')[0]);
                    const token = jwt.sign({_id: saved._id}, process.env.JWT_SECRET);
                    //return response with user and token to frontend client
                    const { _id, name, email, isVerified } = saved;
                    return res.status(200).json({ message : "Sign up successful. Please check your mail box for verification link", token, user : {_id, email, name, isVerified} });
                }
            })
        }
        else{
            return res.status(403).json({
                error : "Email is already registered"
            })
        }
    });
};

const signIn = (req, res) => {
    //find the user based on email
    const { email, password } = req.body;
    User.findOne({email}, (err, user) => {
        //if err or no user
        if(err || !user) {
            return res.status(401).json({
                error : "User with that email does not exist. Please sign up"
            })
        }
        //if user is found, make sure the email and password match
        if(!user.authenticate(password)) {
            return res.status(401).json({
                error : "Email and password do not match"
            }) 
        }

        //if user is found, authenticate
        //generate a token with user id and secret
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
    
        //return response with user and token to frontend client
        const { _id, name, email, isVerified } = user;
        return res.json({token, user : {_id, email, name, isVerified}});
    })
    
}
const adminSignIn = (req, res) => {
    //find the user based on email
    const { email, password } = req.body;
    User.findOne({email}, (err, user) => {
        //if err or no user
        if(err || !user) {
            return res.status(401).json({
                error : "User with that email does not exist. Please sign up"
            })
        }
        //if user is found, make sure the email and password match
        if(!user.isAdmin) {
            return res.status(401).json({
                error : "Invalid credentials"
            })
        }
        if(!user.authenticate(password)) {
            return res.status(401).json({
                error : "Email and password do not match"
            }) 
        }

        //if user is found, authenticate
        //generate a token with user id and secret
        const token = jwt.sign({_id: user._id, isAdmin : user.isAdmin}, process.env.JWT_SECRET);
    
        //return response with user and token to frontend client
        const { _id, name, email, isAdmin } = user;
        return res.json({token, user : {_id, email, name, isAdmin}});
    })
    
}

const tokenValid = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({error :'Authorization error occured, please relogin and retry'});
    }
    next();
}
const requireSignIn = expressJwt({
    //if token is valid, express jwt appends the verified users id in an auth key to the request object
    secret : process.env.JWT_SECRET,
    userProperty : "auth"
});

const isAdmin = (req, res, next) => {
    if(!req.auth.isAdmin) return res.json({"error" : 'Back off, admin route'});
    return next()
}
const confirmUser = (req, res, next) => {
    User.findById(req.body.creator)
    .exec((err, user) => {
        if(err || !user){
            return res.status(400).json({
                error: "Error occured, please relogin and create again"
            })
        }
        req.profile = user; // adds profile object in req with user info
        next();
    })
}

const hasAuthorization = (req, res, next) => {
    const authorized = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!authorized) {
        return res.status(403).json({
            error : "User is not authorized to perform this action"
        })
    }
    next()
}

const forgotPassword = (req, res) => {
    User.findOne({email : req.body.email})
    .exec((err, user) => {
        if(err || !user) return res.status(403).json({error : 'Email not registered on platform'})
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetExpires = Date.now() + 1000 * 60 * 15; //15 minutes validity
        user.save((err, user) => {
            if(err) res.status(400).json({error : 'An error occured, please try again'});
            sendMail(user.email, user.resetPasswordToken)
            .then(info => {
                res.json({user, message : 'Password reset link has been sent successfully'})
            })
            .catch(err => res.status(400).json({error : err}))
        })
    })
}

const confirmResetLink = (req, res) => {
    User.findOne({resetPasswordToken : req.query.token, resetExpires : {$gt : Date.now()}})
    .select('name')
    .exec((err, user) => {
        if(err || !user) res.status(403).json({error : 'Password reset link is invalid or has expired'})
        else res.json({user})
    })
}

const updatePassword = (req, res) => {
    if(req.body.password.trim().length < 7) return res.status(400).json({error : 'Password must be at least 7 characters long'});
    User.findOne({resetPasswordToken : req.query.token, name : req.body.name})
    .exec((err, user) => {
        if(err || !user) return res.status(403).json({error : 'Link has expired'})
        user.resetExpires = null;
        user.resetPasswordToken = null;
        user.password = req.body.password;
        user.save((err, user) => {
            if(err) return res.status(400).json({error : 'An error has occured'})
            return res.json({message : 'password updated successfully, proceed to login'})
        })
    })
}

const sendVerificationMail = async (req, res) => {
    try {
        const { _id } = req.auth;
        const user = await User.findById(_id);
        if(!user) throw new Error('User not found');
        if(user.isVerified) throw new Error('User already verified');
        let token;
        if(!user.emailVerifyToken) {
            token = crypto.randomBytes(20).toString('hex');
            user.emailVerifyToken = token; 
        } else {
            //if mail was sent within last 10 minutes, do not resend
            if((Date.now() - user.verifySent) < 1000 * 60 * 10) throw new Error('Please wait ten minutes before resending a verification mail.');
            token = user.emailVerifyToken; 
        }
        user.verifySent = Date.now();
        await user.save();
        sendVerifyMail(user.email, token, user.name.split(' ')[0])
        .catch(err => {
            return res.status(500).json({ error : 'Error occured while sending mail'})
        })
        return res.json({ message : 'Verification mail sent to ' + user.email});
    } catch (error) {
        return res.status(400).json({ error : error.message })
    }
}

const confirmVerification = async (req, res) => {
    try {
        const { token, email } = req.query;
        if(!token || !email) throw new Error('Invalid verification link');
        const user = await User.findOne({ email, emailVerifyToken : token });
        if(!user) throw new Error('Invalid verification link');
        user.isVerified = true;
        user.emailVerifyToken = null;
        await user.save();
        return res.json({ message : 'Email verified successfully'});
    } catch (error) {
        return res.status(400).json({ error : error.message })
    }
}

const getAllUsers = (req, res) => {
    User.find((err, users) => {
        if(err || !users) return res.status(500).json({error : 'Error getting users'});
        return res.json( users );
    });
}

const deleteUser = (req, res) => {
    const { user } = req.params;
    User.findByIdAndDelete(user, (err, result) => {
        if(err || !result) return res.json({error : "Error deleting user"});
        return res.json({ message : 'User deleted successfully'})
    })
}

export { signUp, signIn, adminSignIn, requireSignIn, isAdmin, tokenValid, confirmUser, hasAuthorization, forgotPassword, confirmResetLink, updatePassword, getAllUsers, deleteUser, sendVerificationMail, confirmVerification };