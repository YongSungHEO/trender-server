var keystone = require('keystone');
var sha256 = require('sha-256-js');

var User = keystone.list('User');


exports.signUp = function (req, res) {
    if (signUpValidation(req.body.userModel, res)) {
        let newUser = new User.model({
            email: req.body.userModel.email,
            password: sha256(req.body.userModel.password),
            passwordHash: sha256(req.body.userModel.password),
            nickname: req.body.userModel.name,
            hint: req.body.userModel.hint,
        });

        newUser.save(function (err, createdUser) {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When create new user.';
                return error500(message, detail, res);
            }
            return res.status(200).json({ result: 'Success' });
        });
    }
};


exports.checkEmail = function (req, res) {
    if (!req.body.email) {
        let message = 'Email is required.';
        let detail = '400. When req email empty.';
        return error400(message, detail, res);
    }
    User.model.findOne({ email: req.body.email }).exec((err, user) => {
        if (err) {
            let message = 'Server error.';
            let detail = '500. When check email.';
            return error500(message, detail, res);
        }
        if (user) {
            let message = 'Email already exist.';
            let detail = '400. When check email.';
            return error400(message, detail, res);
        } else {
            return res.status(200).json({ result: 'Email is not overlapped' });
        }
    });
};


exports.checkName = function (req, res) {
    if (!req.body.name) {
        let message = 'Name is required.';
        let detail = '400. When req name is empty.';
        return error400(message, detail, res);
    }
    User.model.findOne({ nickname: req.body.name }).exec((err, user) => {
        if (err) {
            let message = 'Server error.';
            let detail = '500. When check name.';
            return error500(message, detail, res);
        }
        if (user) {
            let message = 'Name is already exist.';
            let detail = '400. When check name.';
            return error400(message, detail, res);
        } else {
            return res.status(200).json({ result: 'Name is not overlapped' });
        }
    });
};


function signUpValidation (userModel, res) {
    if (!userModel.email) {
        error400('Email is not exist.', '400. When signup.', res);
        return false;
    }
    if (!userModel.password) {
        error400('Password is not exist.', '400. When signup.', res);
        return false;
    }
    if (!userModel.confirmPwd) {
        error400('Confirm password is not exist.', '400. When signup.', res);
        return false;
    }
    if (userModel.password !== userModel.confirmPwd) {
        error400('Two password are not same', '400. When signup.', res);
        return false;
    }
    if (!userModel.name) {
        error400('Name is not exist.', '400. When signup.', res);
        return false;
    }
    if (!userModel.hint) {
        error400('Hint is not exist.', '400. When signup.', res);
        return false;
    }
    return true;
}

function error400(message, detail, res) {
    return res.status(400).json({
        error: {
            message: message,
            detail: detail,
        },
    });
}

function error500(message, detail, res) {
    return res.status(500).json({
        error: {
            message: message,
            detail: detail,
        },
    });
}
