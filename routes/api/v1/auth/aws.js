var keystone = require('keystone');
var AWS = require('aws-sdk');

var User = keystone.list('User');

var config = require('../../../config');
var cognitoidentity = new AWS.CognitoIdentity();


exports.get = function (req, res) {
    var params = {
        IdentityPoolId: config.IdentityPoolId,
        Logins: { 
            [config.Logins] : req.user.nickname
        },
        TokenDuration: 86400
    };

    cognitoidentity.getOpenIdTokenForDeveloperIdentity(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            return res.status(500).json({
                error: {
                    message: 'Authentication',
                    detail: '500. When get amazon cognito.',
                }
            });
        } else {
            return res.status(200).json({ awsToken: data.Token, awsId: data.IdentityId });
        }
    });
};
