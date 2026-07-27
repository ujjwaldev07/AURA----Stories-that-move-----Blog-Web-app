const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        minlength: 4,
        maxlength: 200,
    },

    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },

    content: {
        type: String,
        required: [true, "Content is required"],
        minlength: 20,
    },

    excerpt: {
        type: String,
        maxlength: 300,
        trim: true,
    },

    coverImage: {
        type: String,
        default: "",
        trim: true,
        maxlength: 255,
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    category: {
        type: String,
        trim: true,
        default: "General",
    },

    tags: [
        {
        type: String,
        trim: true,
        lowercase: true,
    },
    ],

    status: {
        type: String,
        enum: ["draft", "published"],
        default: "published",     
    },

    likes: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
   ],

    views: {
        type: Number,
        default: 0, 
   },

    commentsCount: {
        type: Number,
        default: 0,
   },

    readingTime: {
        type: Number,
        default: 0,
   },
},
{
    timestamps: true,
    collection: 'posts',
}
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
