const passport = require('passport');
const { Strategy } = require('passport-local');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

passport.use(new Strategy({ usernameField: 'email' }, async (email, passport, done) => {
    try {
        const user = await User.findOne({ email })
        if (!user) { 
            return done(null, false, { message: "کاربری با این ایمیل ثبت نشده" });
        }
        // compare password with hash in database and check it is correct or not
        const isValidPassword = await bcrypt.compare(passport, user.password);

        if (isValidPassword) {
            return done(null, user)
        } else {
            return done(null, false, { message: "نام کاربری یا کلمه عبور صحیح نمی باشد" })
        }
    } catch (err) {
        console.log(err);
    } 
}))

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser(async function (id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});