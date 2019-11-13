/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
    views: importRoutes('./views'),
    api: importRoutes('./api/v1'),
    auth: importRoutes('./api/v1/auth'),
    my: importRoutes('./api/v1/my'),
};

// Setup Route Bindings
exports = module.exports = function (app) {
    // Cross Origin Resource Sharing
    app.all('/api*', keystone.middleware.cors);
    app.options('/api*', function (req, res) {
        res.sendStatus(200);
    });

	// Views
    app.get('/', routes.views.index);

    // AWS
    app.get('/api/v1/auth/aws', middleware.checkAuth, routes.auth.aws.get);

    // Sign up
    app.post('/api/v1/my/signup', routes.auth.signup.signUp);
    app.post('/api/v1/my/checkemail', routes.auth.signup.checkEmail);
    app.post('/api/v1/my/checkname', routes.auth.signup.checkName);

    // Sign in
    app.post('/api/v1/my/signin', routes.auth.signin.signIn);
    app.get('/api/v1/my/info', middleware.checkAuth, routes.auth.signin.info);

    // Log out
    app.get('/api/v1/my/logout', middleware.checkAuth, routes.auth.logout.logout);

    // Find account
    app.post('/api/v1/my/id', routes.auth.find.findId);
    app.post('/api/v1/my/password', routes.auth.find.findPassword);

    // Setting
    app.post('/api/v1/my/modify-password', middleware.checkAuth, routes.my.setting.modifyPassword);
    app.get('/api/v1/my/posts/:page', middleware.checkAuth, routes.my.setting.myPosts);
    app.get('/api/v1/my/requests/:page', middleware.checkAuth, routes.my.setting.myRequest);

    // Request category
    app.post('/api/v1/category-requests', middleware.checkAuth, routes.api.request.create);
    app.put('/api/v1/category-requests', middleware.checkAuth, routes.api.request.update);
    app.get('/api/v1/category-requests/:page', middleware.checkAuth, routes.api.request.list);

    // Get category
    app.get('/api/v1/categories', routes.api.category.list);
    app.get('/api/v1/categories/:categoryName', middleware.checkAuth, routes.api.category.detail);

    // Post
    app.post('/api/v1/posts', middleware.checkAuth, routes.api.post.create);
    app.put('/api/v1/posts-reply', middleware.checkAuth, routes.api.post.updateReply);
    app.put('/api/v1/posts-like', middleware.checkAuth, routes.api.post.updatePostLike);
    app.put('/api/v1/posts-view', middleware.checkAuth, routes.api.post.updateView);
    app.get('/api/v1/posts/:page', routes.api.post.list);
    app.get('/api/v1/posts-hot', routes.api.post.listHot);
    app.delete('/api/v1/posts/:id', middleware.checkAuth, routes.api.post.delete);

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
