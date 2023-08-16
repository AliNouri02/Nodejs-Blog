const mongoose = require("mongoose");

const { schema } = require('../validator/postValidator')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 300
    },
    body: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "public",
        enum: ["private", "public"],
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

blogSchema.index({ title: "text" });

blogSchema.statics.postValidation = function (body) {
    return schema.validate(body, { abortEarly: false });
};

module.exports = mongoose.model("Blog", blogSchema);
