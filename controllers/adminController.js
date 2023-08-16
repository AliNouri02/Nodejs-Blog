const fs = require("fs");

const multer = require("multer");
const sharp = require('sharp');
const shortId = require('shortid');
const appRoot = require('app-root-path');

const Blog = require('../models/Blog');
const { formatDate } = require('../utils/jalali');
const { get500 } = require('./errorController');
const { storage, fileFilter } = require('../utils/multer');

exports.getDashboard = async (req, res) => {
    // + make string to number
    const page = +req.query.page || 1;
    const postPerPage = +req.query.limit || 4;

    try {
        const numberOfPosts = await Blog.find({ user: req.user._id }).countDocuments();
        const blogs = await Blog.find({ user: req.user.id })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);

        res.render("private/blogs", {
            pageTitle: "بخش مدیریت | داشبورد",
            path: "/dashboard",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            blogs,
            formatDate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPosts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPosts / postPerPage),
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
};

exports.getAddPost = (req, res) => {
    res.render("private/addPost", {
        pageTitle: "بخش مدیریت | ساخت پست جدید",
        path: "/dashboard/add-post",
        layout: "./layouts/dashLayout",
        fullname: req.user.fullname,
    });
};
exports.createPost = async (req, res) => {
    const errorArr = [];

    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`;

    try {
        req.body = { ...req.body, thumbnail };
        await Blog.postValidation(req.body);
        await sharp(thumbnail.data).jpeg({
            quality: 60,
        })
            .toFile(`${appRoot}/public/uploads/thumbnail/${fileName}`)
            .catch(err => console.log(err));

        await Blog.create({ ...req.body, user: req.user.id, thumbnail: fileName });
        res.redirect("/dashboard");
    } catch (err) {
        console.log(err);
        err.inner.forEach((e) => {
            errorArr.push({
                name: e.path,
                message: e.message,
            });
        });
        res.render("private/addPost", {
            pageTitle: "بخش مدیریت | ساخت پست جدید",
            path: "/dashboard/add-post",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            errors: errorArr,
        });
    }
};

exports.getEditPost = async (req, res) => {
    const post = await Blog.findOne({
        _id: req.params.id,
    });

    if (!post) {
        return res.redirect("errors/404");
    }

    if (post.user.toString() != req.user._id) {
        return res.redirect("/dashboard");
    } else {
        res.render("private/editPost", {
            pageTitle: "بخش مدیریت | ویرایش پست",
            path: "/dashboard/edit-post",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            post,
        });
    }
};

exports.editPost = async (req, res) => {
    const errorArr = [];

    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnail/${fileName}`;

    const post = await Blog.findOne({ _id: req.params.id });
    try {
        if (thumbnail.name)
            await Blog.postValidation({ ...req.body, thumbnail });
        else
            await Blog.postValidation({
                ...req.body,
                thumbnail: {
                    name: "placeholder",
                    size: 0,
                    mimetype: "image/jpeg",
                },
            });

        if (!post) {
            return res.redirect("errors/404");
        }

        if (post.user.toString() != req.user._id) {
            return res.redirect("/dashboard");
        } else {
            if (thumbnail.name) {
                fs.unlink(
                    `${appRoot}/public/uploads/thumbnail/${post.thumbnail}`,
                    async (err) => {
                        if (err) console.log(err);
                        else {
                            await sharp(thumbnail.data)
                                .jpeg({ quality: 60 })
                                .toFile(uploadPath)
                                .catch((err) => console.log(err));
                        }
                    }
                );
            }

            const { title, status, body } = req.body;
            post.title = title;
            post.status = status;
            post.body = body;
            post.thumbnail = thumbnail.name ? fileName : post.thumbnail;

            await post.save();
            return res.redirect("/dashboard");
        }
    } catch (err) {
        console.log(err);
        err.inner.forEach((e) => {
            errorArr.push({
                name: e.path,
                message: e.message,
            });
        });
        res.render("private/editPost", {
            pageTitle: "بخش مدیریت | ویرایش پست",
            path: "/dashboard/edit-post",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            errors: errorArr,
            post,
        });
    }
};

exports.deletePost = async (req, res) => {
    const thumbnail = req.files ? req.files.thumbnail : {};
    console.log(thumbnail);
    try {
        if (thumbnail.name) {
            fs.unlink(
                `${appRoot}/public/uploads/thumbnail/${post.thumbnail}`,
            );
        }
        const result = await Blog.findByIdAndRemove(req.params.id);
        console.log(result);
        res.redirect("/dashboard");
    } catch (err) {
        console.log(err);
        res.render("errors/500");
    }
};

exports.uploadImage = (req, res) => {
    const upload = multer({
        limits: { fileSize: 4000000 },
        // dest: "uploads/",
        // storage: storage,
        fileFilter: fileFilter,
    }).single("image");

    upload(req, res, async (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res
                    .status(400)
                    .send("حجم عکس ارسالی نباید بیشتر از 4 مگابایت باشد")
            }
            res.status(400).send(err);
        } else {
            if (req.file) {
                const fileName = `${shortid.generate()} _ ${req.file.originalname}`;
                await sharp(req.file.buffer).jpeg({
                    quality: 60,
                })
                    .toFile(`./public/uploads/${fileName}`)
                    .catch(err => console.log(err))
                res.status(200).send(`http://localhost:3002/uploads/${fileName}`);
            } else {
                res.send("جهت اپلود باید عکسی انتخاب کنیم")
            }
        }
    });
};

exports.handleDashSearch = async (req, res) => {
    const page = +req.query.page || 1;
    const postPerPage = 2;

    try {
        const numberOfPosts = await Blog.find({
            user: req.user._id,
            $text: { $search: req.body.search },
        }).countDocuments();
        const blogs = await Blog.find({
            user: req.user.id,
            $text: { $search: req.body.search },
        })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);

        res.render("private/blogs", {
            pageTitle: "بخش مدیریت | داشبورد",
            path: "/dashboard",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            blogs,
            formatDate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPosts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPosts / postPerPage),
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
};
