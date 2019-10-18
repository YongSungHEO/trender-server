var keystone = require('keystone');

var AuthToken = keystone.list('AuthToken');


exports.logout = function (req, res) {
    AuthToken.model.remove({ user_id: req.user._id }).exec((err, result) => {
        if (err) return res.status(500).json({
            error: {
                message: 'Server error.',
                detail: '500. When logout.',
            },
        });
        return res.status(200).json({ result: 'Success' });
    });
};
