var keystone = require('keystone');
var sha256 = require('sha-256-js');
var uuidv4 = require('uuid/v4');

var User = keystone.list('User');
var AuthToken = keystone.list('AuthToken');


exports.signIn = function (req, res) {
    if (loginValidation(req.body.userModel, res)) {
        const email = req.body.userModel.email;
        const password = sha256(req.body.userModel.password);

        User.model.findOne({ email: email, passwordHash: password }).exec((err, user) => {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When sign in.';
                return error(message, detail, res, 500);
            }
            if (!user) {
                let message = 'There is no user match with email or password.';
                let detail = '400. When sign in.';
                return error(message, detail, res, 400);
            }

            AuthToken.model.findOne({ user_id: user._id }).exec((err, token) => {
                if (err) {
                    let message = 'Server error.';
                    let detail = '500. When find auth token.';
                    return error(message, detail, res, 500);
                }
                if (token) {
                    token.set('token', uuidv4());
                    token.save((err, updatedToken) => {
                        if (err) {
                            let message = 'Server error.';
                            let detail = '500. When update auth token.';
                            return error(message, detail, res, 500);
                        }
                        return res.status(200).json({
                            authToken: updatedToken.token,
                            nickname: user.nickname,
                            adminLevel: user.adminLevel,
                        });
                    });
                } else {
                    let newAuthToken = new AuthToken.model({
                        user_id: user._id,
                    });
                    newAuthToken.save((err, createdAuth) => {
                        if (err) {
                            let message = 'Server error.';
                            let detail = '500. When create new auth token.';
                            return error(message, detail, res, 500);
                        }
                        return res.status(200).json({
                            authToken: createdAuth.token,
                            nickname: user.nickname,
                            adminLevel: user.adminLevel,
                        });
                    });
                }
            });
        });
    }
};


exports.info = function (req, res) {
    return res.status(200).json({
        nickname: req.user.nickname,
        adminLevel: req.user.adminLevel,
    });
}


function loginValidation (userModel, res) {
    const regExp = /^[0-9a-zA-Z_]*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    if (!userModel.email.match(regExp)) {
        let message = 'Email format is wrong.';
        let detail = '400. When check email validation.';
        error(message, detail, res, 400);
        return false;
    }
    if (userModel.password.length < 8 || userModel.password.length > 16) {
        let message = 'Password length is between 8 and 16.';
        let detail = '400. When check password validation.';
        error(message, detail, res, 400);
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
