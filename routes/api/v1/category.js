var keystone = require('keystone');

var Category = keystone.list('Category');
var Post = keystone.list('Post');


exports.list = function (req, res) {
    let promise1 = new Promise((resolve, reject) => {
        Category.model.find({}, { _id: 0 }).exec((err, categories) => {
            if (err) {
                reject(err);
            }
            resolve(categories);
        });
    });

    const searchWord = req.query.searchWord;
    let promise2 = new Promise((resolve, reject) => {
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
                    reject(err)
                }
                resolve(results);
            });
    });
    Promise.all([promise1, promise2]).then(results => {
        const categories = results[0];
        const aggregated = results[1][0];
        if (!searchWord) {
            let toAdd1 = categories
                            .filter(category => {
                                return category.category === 'post'
                                        && !aggregated.posts.some(post => {
                                                return post._id === category.categoryName
                                            })
                            });
            let toAdd2 = categories
                            .filter(category => {
                                return category.category === 'album'
                                        && !aggregated.posts.some(post => {
                                                return post._id === category.categoryName
                                            })
                            });
            toAdd1.map(item => {
                const added = {
                    _id: item.categoryName,
                    count: 0,
                };
                aggregated.posts.push(added);
            });
            toAdd2.map(item => {
                const added = {
                    _id: item.categoryName,
                    count: 0,
                };
                aggregated.albums.push(added);
            });
        }
        return res.status(200).json({
            posts: aggregated.posts,
            albums: aggregated.albums,
        });
    }).catch(err => {
        console.log(err)
        let message = 'Server error.';
        let detail = '500. When get categories.';
        return error(message, detail, res, 500);
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
