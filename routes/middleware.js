/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var _ = require('lodash');
var keystone = require('keystone');


/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' },
	];
	res.locals.user = req.user;
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};


exports.checkAuth = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(400).json({
            error: {
                message: 'Invalidated.',
                detail: '400. Middleware. Token is not exist in headers.',
            },
        });
    }

    keystone.list('AuthToken').model.findOne({ token: req.headers.authorization }).exec((err, token) => {
        if (err) return res.status(500).json({
            error: {
                message: 'Server error',
                detail: '500. Middleware error. When find AuthToken model.',
            },
        });
        if (!token) {
            return res.status(401).json({
                error: {
                    message: 'Unauthorized account.',
                    detail: '401. Middleware authToken.',
                },
            });
        } else {
            keystone.list('User').model.findOne({ _id: token.user_id }).exec((err, user) => {
                if (err) return res.status(500).json({
                    error: {
                        message: 'Server error',
                        detail: '500. Middleware error. When find user model.',
                    },
                });
                if (!user) {
                    return res.status(401).json({
                        error: {
                            message: 'Unauthorized account.',
                            detail: '401. Middleware user.',
                        },
                    });
                } else {
                    req.user = user;
                    next();
                }
            });
        }
    });
};
