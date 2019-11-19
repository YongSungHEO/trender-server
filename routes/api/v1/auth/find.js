var keystone = require('keystone');
var sha256 = require('sha-256-js');

var User = keystone.list('User');


exports.findId = function (req, res) {
    let userModel = req.body.userModel;
    User.model.findOne({ nickname: userModel.nickname, hint: userModel.hint }).exec((err, user) => {
        if (err) {
            let message = 'Server error.';
            let detail = '500. When find user Id.';
            return error (message, detail, res, 500);
        }
        if (!user) {
            let message = 'There is no user match with nickname and hint.';
            let detail = '400. When user is not exist matched with user input.';
            return error (message, detail, res, 400);
        }

        let manufacturedEmail = manufactureEmail(user.email);

        return res.status(200).json({
            nickname: user.nickname,
            email: manufacturedEmail,
        });
    });
}


exports.findPassword = function (req, res) {
    User.model.findOne({ email: req.body.email, hint: req.body.hint }).exec((err, user) => {
        if (err) {
            let message = 'Server error.';
            let detail = '500. When find password.';
            return error (message, detail, res, 500);
        }
        if (!user) {
            let message = 'User not exist.';
            let detail = '400. There is no user match with email and hint.';
            return error (message, detail, res, 400);
        }
        const newPassword = Math.floor(Math.random() * 100000000);
        user.passwordHash = sha256(newPassword.toString());
        user.save((err, updated) => {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When update user password.';
                return error (message, detail, res, 500);
            }
            return res.status(200).json({ newPassword: newPassword });
        });
    });
}


function error (message, detail, res, status) {
    return res.status(status).json({
        error: {
            message: message,
            detail: detail
        },
    });
}

function manufactureEmail (email) {
    let front = email.split('@')[0];
    let back = email.split('@')[1];
    let showingLength = Math.floor(front.split('@')[0].length * 0.6);
    let star = Array(front.length - showingLength).fill('*').join('');
    let manufacturedEmail = front.substring(0, showingLength) + star + '@' + back;
    return manufacturedEmail;
}
