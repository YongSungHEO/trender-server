var sha256 = require('sha-256-js');


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
