var keystone = require('keystone');

var Post = keystone.list('Post');


exports.list = function (req, res) {
    Post.model
        .aggregate([
            { $facet: {
                posts: [
                    { $match: { category: 'post' } },
                    { $group: { _id: '$categoryName', count: {$sum: 1} } },
                ],
                albums: [
                    { $match: { category: 'album' } },
                    { $group: { _id: '$categoryName', count: {$sum: 1} } },
                ]
            }}
        ])
        .cursor()
        .exec()
        .toArray((err, results) => {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When get list of categories.';
                return error(message, detail, res, 500);
            }
            return res.status(200).json({ results: results });
        });
};


function error (message, detail, res, status) {
    return res.status(status).json({
        error: {
            message: message,
            detail: detail
        },
    });
}
