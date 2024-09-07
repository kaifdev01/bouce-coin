const Joi = require('joi')
const User = require('../models/user')
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/
const bcrypt = require('bcrypt')
const UserDTO = require('../dto/user')
const JWTservices = require('../services/JWTservices')
const RefreshToken = require('../models/toekn')
const authController = {
    async register(req, res, next) {
        // 1.validate input
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref("password"),
        });
        const { error } = userRegisterSchema.validate(req.body);

        // 2. if error in validation -> return error via middleware
        if (error) {
            return next(error);
        }

        // 3. if email or username is already registered -> return an error
        const { name, username, email, password } = req.body;

        try {
            const emailInUse = await User.exists({ email });

            const usernameInUse = await User.exists({ username });

            if (emailInUse) {
                const error = {
                    status: 409,
                    message: "Email already registered, use another email!",
                };

                return next(error);
            }

            if (usernameInUse) {
                const error = {
                    status: 409,
                    message: "Username not available, choose another username!",
                };

                return next(error);
            }
        } catch (error) {
            return next(error);
        }

        // 4. password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. store user data in db
        let accessToken;
        let refreshToken;
        let user;
        try {
            const userToRegister = new User({
                username,
                email,
                name,
                password: hashedPassword,
            });

            user = await userToRegister.save();
            // jwt
            accessToken = JWTservices.signAccessToken({ _id: user._id }, '30m')
            refreshToken = JWTservices.signRefreshToken({ _id: user._id }, '60m')
        } catch (error) {
            return next(error);
        }
        // 6.response send
        JWTservices.storeRefreshToken("refreshToken", user._id)

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        return res.status(201).json({ user, auth: true });
    },
    async login(req, res, next) {
        // 1.validate user input
        const userLoginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
        });

        const { error } = userLoginSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        const { email, password } = req.body;

        // const username = req.body.username
        // const password = req.body.password

        let user;

        try {
            // match username
            user = await User.findOne({ email: email });

            if (!user) {
                const error = {
                    status: 401,
                    message: "Invalid username",
                };

                return next(error);
            }

            // match password
            // req.body.password -> hash -> match

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                const error = {
                    status: 401,
                    message: "Invalid password",
                };

                return next(error);
            }
        } catch (error) {
            return next(error);
        }
        let accessToken;
        let refreshToken;
        accessToken = JWTservices.signAccessToken({ _id: user._id }, '30m')
        refreshToken = JWTservices.signRefreshToken({ _id: user._id }, '60m')
        // update refresh Token
        try {
            RefreshToken.updateOne({
                _id: user._id
            },
                { token: refreshToken },
                { upsert: true }
            )

        } catch (error) {
            return next(error)
        }

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })
        // send response
        const userDTO = new UserDTO(user)
        return res.status(200).json({ user: userDTO, auth: true })
    },
    async logout(req, res, next) {
        console.log(req)
        const { refreshToken } = req.cookies;
        try {
            await RefreshToken.deleteOne({ token: refreshToken })
        } catch (err) {
            return next(err)
        }
        res.status(200).json({ user: null, auth: false })
        // clear cookies
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
    }, async refresh(req, res, next) {
        const orignalRefreshToken = req.cookies.refreshToken;
        let id;
        try {
            id = JWTservices.verifyRefreshToken(orignalRefreshToken)._id;

        } catch (e) {
            const error = {
                status: 401,
                message: 'Unauthorized'
            }
            return next(error)
        }

        try {
            const match = RefreshToken.findOne({ _id: id, token: orignalRefreshToken })
            if (!match) {
                let error = {
                    status: 401,
                    message: 'Unauthorized'
                }
                return next(error)
            }
        } catch (e) {
            return next(e);
        }

        try {
            const accessToken = JWTservices.signAccessToken({ _id: id }, "30m");

            const refreshToken = JWTservices.signRefreshToken({ _id: id }, "60m");

            await RefreshToken.updateOne({ _id: id }, { token: refreshToken });

            res.cookie("accessToken", accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
            });
        } catch (e) {
            return next(e);
        }

        const user = await User.findOne({ _id: id });

        const userDto = new UserDTO(user);

        return res.status(200).json({ user: userDto, auth: true });
    }
}


module.exports = authController;