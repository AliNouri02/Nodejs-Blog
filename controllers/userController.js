const passport = require('passport');

const fetch = require('cross-fetch');

const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');
const  jwt  = require('jsonwebtoken');


exports.login = (req, res) => {
    res.render("login", {
        pageTitle: "ورود به بخش مدیریت",
        path: "/login",
        message: req.flash('success_msg'),
        error: req.flash("error")
    });
}

exports.logout = (req, res) => {
    req.session = null
    req.logout(function (err) {
        if (err) {
            // Handle any error that occurs during logout
            console.error(err);
        }
        // req.flash("success_msg", "خروج موفقیت امیز بود");
        res.redirect('/users/login');
    });
};

exports.register = (req, res) => {
    res.render("register", {
        pageTitle: "ثبت نام کاربر جدید",
        path: "/register",
    });
};

exports.handelLogin = async (req, res, next) => {
    if (!req.body['g-recaptcha-response']) {
        req.flash('error', "مگه رباتی")
        return res.redirect("/users/login")
    }

    const secretKey = process.env.CAPTCHA_SECRET;
    const verfyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}&remoteip=${req.connection.remoteAddress}`;


    const response = await fetch(verfyUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        }
    });

    const josn = await response.json();
    console.log(josn);
    if (josn.success) {
        passport.authenticate('local', {
            failureRedirect: '/users/login',
            failureFlash: true,
        })(req, res, next);
    } else {
        req.flash("error", "مشکلی در اعتبار سنجی captcha")
        res.redirect('/users/login')
    }

}

exports.rememberMe = (req, res, next) => {
    if (req.body.remember) {
        req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000 * 7;
    } else {
        req.session.cookie.expire = null
    }

    res.redirect("/dashboard")
}

exports.createUser = async (req, res) => {
    const errors = [];

    try {
        await User.userValidation(req.body);
        const { fullname, email, password } = req.body
        const user = await User.findOne({ email })
        if (user) {
            errors.push({ message: "کاربری با این ایمیل موجود است" })
            return res.render('register', {
                pageTitle: "ثبت نام کاربر جدید",
                path: "/register",
                errors
            });
        }
        await User.create({
            fullname,
            email,
            password
        });

        //Send Welcome Email
        sendEmail(email, fullname, "خوش امدید به وبلاگ ما", "حضور شما باعث دلگرمی ماست")

        req.flash("success_msg", "ثبت نام موفقیت امیز بود")
        res.redirect('/users/login');
        // For Hash Password
        // bcrypt.genSalt(10, (err, salt) => {
        //     if (err) throw err;
        //     bcrypt.hash(password, salt, async (err, hash) => {
        //         if (err) throw err;

        //         await User.create({
        //             fullName,
        //             email,
        //             password: hash
        //         });
        //         res.redirect('/users/login');
        //     })
        // })

        // For Create User

        // const user = new User({
        //     fullname,
        //     email,
        //     password
        // })
        // user.save()
        //     .then((user) => {
        //         console.log(user);
        //         res.redirect('/users/login');
        //     })
        //     .catch((err) => {
        //         if (err) throw err;
        //     })
    } catch (error) {
        console.log("ffffffff");
        console.log(error);
        error.inner.forEach(e => {
            errors.push({
                name: e.path,
                message: e.message
            })
        });
        return res.render('register', {
            pageTitle: "ثبت نام کاربر جدید",
            path: "/register",
            errors
        });
    }
}

exports.forgetPassword = async (req, res) => {

    res.render("forgetPass", {
        pageTitle: "فراموشی رمز عبور",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash('error')
    })
}

exports.handleForgetPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
        req.flash("error", "کاربری با ایمیل در پایگاه داده ثبت نیست");

        return res.render("forgetPass", {
            pageTitle: "فراموشی رمز عبور",
            path: "/login",
            message: req.flash("success_msg"),
            error: req.flash("error"),
        });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    const resetLink = `http://localhost:${process.env.PORT}/users/reset-password/${token}`;

    sendEmail(
        user.email,
        user.fullname,
        "فراموشی رمز عبور",
        `
        جهت تغییر رمز عبور فعلی رو لینک زیر کلیک کنید
        <a href="${resetLink}">لینک تغییر رمز عبور</a>
    `
    );

    req.flash("success_msg", "ایمیل حاوی لینک با موفقیت ارسال شد");

    res.render("forgetPass", {
        pageTitle: "فراموشی رمز عبور",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error"),
    });
};

exports.resetPassword = async (req, res) => {
    const token = req.params.token;

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decodedToken);
    } catch (err) {
        console.log(err);
        if (!decodedToken) {
            return res.redirect("/404");
        }
    }

    res.render("resetPass", {
        pageTitle: "تغییر پسورد",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        userId: decodedToken.userId,
    });
};

exports.handleResetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        req.flash("error", "کلمه های عبور یاکسان نیستند");

        return res.render("resetPass", {
            pageTitle: "تغییر پسورد",
            path: "/login",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            userId: req.params.id,
        });
    }

    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
        return res.redirect("/404");
    }

    user.password = password;
    await user.save();

    req.flash("success_msg", "پسورد شما با موفقیت بروزرسانی شد");
    res.redirect("/users/login");
};
