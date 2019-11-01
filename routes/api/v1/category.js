var keystone = require('keystone');

var Post = keystone.list('Post');


exports.list = function (req, res) {
    const searchWord = req.query.searchWord;
    Post.model
        .aggregate([
            { $facet: {
                posts: [
                    { $match: searchWord ? { category: 'post', categoryName: {$regex : '.*' + searchWord + '.*'} } : { category: 'post' } },
                    { $group: { _id: '$categoryName', count: {$sum: 1} } },
                ],
                albums: [
                    { $match: searchWord ? { category: 'album', categoryName: {$regex : '.*' + searchWord + '.*'} } : { category: 'album' } },
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
