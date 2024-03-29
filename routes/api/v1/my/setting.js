var keystone = require('keystone');
var sha256 = require('sha-256-js');

var Post = keystone.list('Post');
var Request = keystone.list('Request');


exports.modifyPassword = function (req, res) {
    if (modifyPwdValidation(req.user, req, res)) {
        req.user.passwordHash = sha256(req.body.modifyPwd);
        req.user.save((err, updated) => {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When modify password.';
                return error(message, detail, res, 500);
            }
            return res.status(200).json({ result: 'Success' });
        });
    }
};


exports.myPosts = function (req, res) {
    let promise1 = new Promise((resolve, reject) => {
        Post.model.find({ user_id: req.user._id }).count().exec((err, count) => {
            if (err) {
                reject(err);
            }
            resolve(count);
        });
    });
    let promise2 = new Promise((resolve, reject) => {
        Post.model.find({ user_id: req.user._id }, { user_id: 0 })
            .sort('-created')
            .skip((req.params.page - 1) * 7)
            .limit(7)
            .exec((err, posts) => {
                if (err) {
                    reject(err);
                }
                resolve(posts);
            });
    });
    Promise.all([promise1, promise2]).then(results => {
        return res.status(200).json({
            count: results[0],
            posts: results[1],
        })
    }).catch(err => {
        let message = 'Server error.';
        let detail = '500. When find my posts.';
        return error(message, detail, res, 500);
    });
};


exports.myRequest = function (req, res) {
    let promise1 = new Promise((resolve, reject) => {
        Request.model.find({ nickname: req.user.nickname }).count().exec((err, count) => {
            if (err) {
                reject(err);
            }
            resolve(count);
        });
    });
    let promise2 = new Promise((resolve, reject) => {
        Request.model.find({ nickname: req.user.nickname }, { user_id: 0 })
            .sort('-requestTime')
            .skip((req.params.page - 1) * 7)
            .limit(7)
            .exec((err, posts) => {
                if (err) {
                    reject(err);
                }
                resolve(posts);
            });
    });
    Promise.all([promise1, promise2]).then(results => {
        return res.status(200).json({
            count: results[0],
            requests: results[1],
        })
    }).catch(err => {
        let message = 'Server error.';
        let detail = '500. When find my requests.';
        return error(message, detail, res, 500);
    });
};


function modifyPwdValidation(user, req, res) {
    if (user.passwordHash !== sha256(req.body.currentPwd)) {
        let message = '비밀번호가 틀렸습니다.';
        let detail = '400. User password is wrong in modify password.';
        return error(message, detail, res, 400);
    }
    if (req.body.modifyPwd !== req.body.confirmPwd) {
        let message = '변경 비밀번호가 같지 않습니다.';
        let detail = '400. Modify password and confirm password is not same.';
        return error(message, detail, res, 400);
    }
    if (req.body.modifyPwd.length < 8 || req.body.confirmPwd.length < 8) {
        let message = '변경할 비밀번호는 8자 이상이어야 합니다.';
        let detail = '400. Modify pwd or confirm pwd length is less than 8.';
        return error(message, detail, res, 400);
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
