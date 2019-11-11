var keystone = require('keystone');

var Post = keystone.list('Post');
var Category = keystone.list('Category');


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
            imageName: req.body.imageName
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
                req.body.reply.nickname = req.user.nickname;
                post.reply.unshift(req.body.reply);
            } else {
                post.reply[index] = req.body.reply;
                post.reply[index].user_id = req.user._id;
                post.reply[index].nickname = req.user.nickname;
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


exports.updatePostLike = function (req, res) {
    Post.model.findOne({ _id: req.body.post_id }).exec((err, post) => {
        if (err) {
            let message = 'Server error.';
            let detail = '500. When get post for update post like.';
            return error(message, detail, res, 500);
        }
        if (post.likeUsers.some(nickname => nickname === req.user.nickname )) {
            post.likeUsers.splice(req.user.nickname, 1);
            post.like--;
        } else {
            post.likeUsers = post.likeUsers.concat([req.user.nickname]);
            post.like++;
        }
        post.save((err, updated) => {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When update post like.';
                return error (message, detail, res, 500);
            }
            return res.status(200).json({ like: updated.like });
        });
    });
};


exports.updateView = function (req, res) {
    Post.model.findOne({ _id: req.body.post_id }).exec((err, post) => {
        if (err) {
            let message = 'Server error.';
            let detail = '500. When get post for update view.';
            return error(message, detail, res, 500);
        }
        post.view++;
        post.save((err, updated) => {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When update post view.';
                return error (message, detail, res, 500);
            }
            return res.status(200).json({ result: 'success' });
        });
    });
};


exports.list = function (req, res) {
    const searchWord = req.query.searchWord;
    const defaultCondition = {
        category: req.query.category,
        categoryName: req.query.categoryName
    };
    const searchCondition = {
        category: req.query.category,
        categoryName: req.query.categoryName,
        title: {$regex : '.*' + searchWord + '.*'}
    };
    let promise1 = new Promise((resolve, reject) => {
        Post.model
            .find(searchWord ? searchCondition : defaultCondition)
            .count()
            .exec((err, count) => {
                if (err) {
                    reject(err);
                }
                resolve(count);
            });
    });
    let promise2 = new Promise((resolve, reject) => {
        Post.model
            .find(searchWord ? searchCondition : defaultCondition, { user_id: 0, 'reply.user_id': 0 })
            .sort('-created')
            .skip((req.params.page - 1) * 15)
            .limit(15)
            .exec((err, posts) => {
                if (err) {
                    reject(err);
                }
                resolve(posts);
            });
    });
    let promise3 = new Promise((resolve, reject) => {
        Category.model.findOne({ categoryName: req.query.categoryName }).exec((err, category) => {
            if (err) {
                reject(err);
            }
            resolve(category);
        });
    })
    Promise.all([promise1, promise2, promise3]).then(results => {
        return res.status(200).json({
            count: results[0],
            posts: results[1],
            creator: results[2].creator,
            description: results[2].description
        });
    }).catch(err => {
        let message = 'Server error.';
        let detail = '500. When find my posts.';
        return error(message, detail, res, 500);
    });
};


exports.listHot = function (req, res) {
    let promise1 = new Promise((resolve, reject) => {
        Post.model
        .find({ category: 'post' })
        .sort('like')
        .limit(10)
        .exec((err, posts) => {
            if (err) {
                reject(err);
            }
            resolve(posts);
        });
    });
    let promise2 = new Promise((resolve, reject) => {
        Post.model
        .find({ category: 'album' })
        .sort('like')
        .limit(4)
        .exec((err, posts) => {
            if (err) {
                reject(err);
            }
            resolve(posts);
        });
    });
    Promise.all([promise1, promise2]).then(results => {
        return res.status(200).json({
            posts: results[0],
            albums: results[1]
        });
    }).catch(err => {
        let message = 'Server error.';
        let detail = '500. When get hot posts.';
        return error(message, detail, res, 500);
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
    if (!post.title && post.category === 'post') {
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
