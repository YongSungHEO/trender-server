var keystone = require('keystone');

var Request = keystone.list('Request');
var Category = keystone.list('Category');


exports.create = function (req, res) {
    if (createRequestValidation(req.body, res)) {
        let newRequest = new Request.model({
            category: req.body.category,
            categoryName: req.body.categoryName,
            description: req.body.description,
            nickname: req.body.nickname,
        });
        newRequest.save ((err, created) => {
            if (err) {
                let message = 'Server error.';
                let detail = '500. When create request.';
                return error (message, detail, res, 500);
            }
            return res.status(200).json({ result: 'Success' });
        });
    }
};


exports.update = function (req, res) {
    if (updateRequestValidation(req.body, res)) {
        Request.model.findOne({ _id: req.body._id }).exec((err, request) => {
            if (request.state === 'permitted' || request.state === 'rejected') {
                let message = 'Already permitted or rejected.';
                let detail = '400. Request already updated.';
                return error (message, detail, res, 400);
            }
            request.state = req.body.state;
            if (request.state === 'permitted') {
                request.resultMessage = 'Category is permitted.';
            }
            if (request.state === 'rejected') {
                request.resultMessage = req.body.resultMessage;
            }
            let promise1 = new Promise((resolve, reject) => {
                request.save((err, updated) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(updated);
                });
            });
            let newCategory = new Category.model({
                category: request.category,
                categoryName: request.categoryName,
                creator: request.nickname
            });
            let promise2 = new Promise((resolve, reject) => {
                newCategory.save((err, created) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(created);
                });
            });
            Promise.all([promise1, promise2]).then(results => {
                return res.status(200).json({ result: 'Success' });
            }).catch(err => {
                return error('Server error.', '500. In update request API.', res, 500);
            });
        });
    }
};


function createRequestValidation (request, res) {
    if (!request.category) {
        let message = 'Category is required.';
        let detail = '400. Category is empty.';
        error(message, detail, res, 400);
        return false;
    }
    if (request.category !== 'post' && request.category !== 'album') {
        let message = 'Category must be post or album.';
        let detail = '400. Category type error.';
        error(message, detail, res, 400);
        return false;
    }
    if (!request.categoryName) {
        let message = 'Category name is required.';
        let detail = '400. Category name is empty.';
        error (message, detail, res, 400);
    }
    if (!request.description) {
        let message = 'Description is required.';
        let detail = '400. Description is empty.';
        error (message, detail, res, 400);
        return false;
    }
    if (!request.nickname) {
        let message = 'Nickname is required.';
        let detail = '400. Nickname is empty.';
        error (message, detail, res, 400);
        return false;
    }
    if (request.state && request.state !== 'wait') {
        let message = 'State is wrong.';
        let detail = '400. State must be empty or wait.';
        error (message, detail, res, 400);
        return false;
    }
    return true;
}

function updateRequestValidation(request, res) {
    if (!request.state) {
        let message = 'State is required.';
        let detail = '400. State is empty.';
        error (message, detail, res, 400);
        return false;
    }
    if (request.state !== 'permitted' && request.state !== 'rejected') {
        let message = 'State is wrong.';
        let detail = '400. State type is wrong in update.';
        error (message, detail, res, 400);
        return false;
    }
    if (request.state === 'rejected' && !request.resultMessage) {
        let message = 'Result message is required.';
        let detail = '400. If request is rejected, result messgae is required.';
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
