const Blog = require("../models/Blog");
const { formatDate } = require("../utils/jalali");
const { truncate } = require("../utils/helpers");

const { object, string} = require("yup");
const captchapng = require("captchapng");
const appRoot = require('app-root-path');
const { sendEmail } = require("../utils/mailer");

let CAPTCHA_NUM;

exports.getIndex = async (req, res) => {
    const page = +req.query.page || 1;
    const postPerPage = 5;
    try {
        const numberOfPosts = await Blog.find({
            status: "public"
        }).countDocuments();
        console.log();

        const posts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);
            let src = `${process.env.WEBSITE_URL}:${process.env.PORT}/uploads/thumbnail/`

        res.render("index", {
            pageTitle: "وبلاگ",
            path: '/',
            posts,
            src,
            formatDate,
            truncate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPosts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPosts / postPerPage),
        });
        //? Smooth Scrolling
    } catch (err) {
        console.log(err);
        res.render("errors/500");
    }
};

exports.getSinglePost = async (req, res) => {
    try {
        const post = await Blog.findOne({ _id: req.params.id }).populate(
            "user"
        );

        let src = `${process.env.WEBSITE_URL}:${process.env.PORT}/uploads/thumbnail/${post.thumbnail}`

        if (!post) return res.redirect("errors/404");
        res.render("post", {
            pageTitle: post.title,
            path: "/post",
            src,
            post,
            formatDate,
        });
    } catch (err) {
        console.log(err);
        res.render("errors/500");
    }
};

exports.getContactPage = (req, res) => {
    res.render("contact", {
        pageTitle: "تماس با ما",
        path: "/contact",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        errors: [],
    });
};

exports.handleContactPage = async (req, res) => {
    const errorArr = [];

    const { fullname, email, message, captcha } = req.body;

    const schema = object().shape({
        fullname: string().required("نام و نام خانوادگی الزامی می باشد"),
        email: string()
            .email("آدرس ایمیل صحیح نیست")
            .required("آدرس ایمیل الزامی می باشد"),
        message: string().required("پیام اصلی الزامی می باشد"),
    });

    try {
        await schema.validate(req.body, { abortEarly: false });

        if (parseInt(captcha) === CAPTCHA_NUM) {

            sendEmail(
                email,
                fullname,
                "پیام از طرف وبلاگ",
                `${message} <br/> ایمیل کاربر : ${email}`
            );
            console.log('fffffffff');

            req.flash("success_msg", "پیام شما با موفقیت ارسال شد");

            return res.render("contact", {
                pageTitle: "تماس با ما",
                path: "/contact",
                message: req.flash("success_msg"),
                error: req.flash("error"),
                errors: errorArr,
            });
        }

        req.flash("error", "کد امنیتی صحیح نیست");

        res.render("contact", {
            pageTitle: "تماس با ما",
            path: "/contact",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            errors: errorArr,
        });

    } catch (err) {
        err.inner.forEach((e) => {
            errorArr.push({
                name: e.path,
                message: e.message,
            });
        });
        res.render("contact", {
            pageTitle: "تماس با ما",
            path: "/contact",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            errors: errorArr,
        });
    }
};

exports.getCaptcha = (req, res) => {
    CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);
    const p = new captchapng(80, 30, CAPTCHA_NUM);
    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);

    const img = p.getBase64();
    const imgBase64 = Buffer.from(img, "base64");

    res.send(imgBase64);
};

exports.handleSearch = async (req, res) => {
    const page = +req.query.page || 1;
    const postPerPage = 5;

    try {
        const numberOfPosts = await Blog.find({
            status: "public",
            $text: { $search: req.body.search },
        }).countDocuments();

        const posts = await Blog.find({
            status: "public",
            $text: { $search: req.body.search },
        })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);
            let src = `${process.env.WEBSITE_URL}:${process.env.PORT}/uploads/thumbnail/`

        res.render("index", {
            pageTitle: "نتایج جستجوی شما",
            path: "/",
            posts,
            src,
            formatDate,
            truncate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPosts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPosts / postPerPage),
        });
        //? Smooth Scrolling
    } catch (err) {
        console.log(err);
        res.render("errors/500", {
            pageTitle: "خطای سرور | 500",
            path: "/404",
        });
    }
};
