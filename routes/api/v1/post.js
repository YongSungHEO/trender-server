var keystone = require('keystone');

var Post = keystone.list('Post');


exports.create = function (req, res) {
    if (createValidation(req.body, res)) {
        let newPost = new Post.model({
            user_id: req.user._id,
            nickname: req.user.nickname,
            category: req.body.category,
            categoryName: req.body.categoryName,
            title: req.body.title,
            description: req.body.description,
            imageURL: req.body.imageURL,
        });
        newPost.save((err, created) => {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When create new Post.';
                return error (message, detail, res, 500);
            }
            return res.status(200).json({ result: 'Success' });
        });
    }
};


exports.updateReply = function (req, res) {
    Post.model.findOne({ _id: req.body.post_id }).exec((err, post) => {
        if (err) {
            let message = 'Server error.';
            let detail = '500. When find post for update.';
            return error (message, detail, res, 500);
        }
        if (req.body.reply) {
            let index = post.reply.findIndex(reply => reply._id.equals(req.body.reply._id));
            if (index < 0) {
                req.body.reply.user_id = req.user._id;
                post.reply.unshift(req.body.reply);
            } else {
                post.reply[index] = req.body.reply;
                post.reply[index].user_id = req.user._id;
            }
        } else {
            let index = post.reply.findIndex(reply => reply._id.equals(req.body.reply_id));
            if (index >= 0) {
                post.reply.splice(index, 1);
            }
        }
        post.save((err, updated) => {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When update reply.';
                return error (message, detail, res, 500);
            }
            return res.status(200).json({ result: 'Success' });
        });
    });
};


exports.list = function (req, res) {
    Post.model.find({ category: req.query.category, categoryName: req.query.categoryName}, { user_id: 0 })
        .sort('-created')
        .skip((req.params.page - 1) * 5)
        .limit(5)
        .exec((err, posts) => {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When get list of posts.';
                error (message, detail, res, 500);
            }
            return res.status(200).json({ posts: posts });
        });
};


exports.delete = function (req, res) {
    Post.model.findOne({ _id: req.body.post_id }).remove().exec((err, result) => {
        if (err) {
            let message = 'Server error.';
            let detail = '500. When remove post.';
            return error (message, detail, res, 500);
        }
        return res.status(200).json({ result: 'Success' });
    });
};


function createValidation (post, res) {
    if (!post.category) {
        let message = 'Category is required.';
        let detail = '400. Create post validation.';
        error (message, detail, res, 400);
        return false;
    }
    if (post.category !== 'post' && post.category !== 'album') {
        let message = 'Category type is wrong.';
        let detail = '400. Create post validation.';
        error (message, detail, res, 400);
        return false;
    }
    if (!post.categoryName) {
        let message = 'Category name is required.';
        let detail = '400. Create post validation.';
        error (message, detail, res, 400);
        return false;
    }
    if (!post.title) {
        let message = 'Title is required.';
        let detail = '400. Create post validation.'
        error (message, detail, res, 400);
        return false;
    }
    if (!post.description) {
        let message = 'Description is required.';
        let detail = '400. Create post validation.';
        error (message, detail, res, 400);
        return false;
    }
    return true;
}

function error (message, detail, res, status) {
    return res.status(status).json({
        error: {
            message: message,
            detail: detail
        },
    });
}
