require('dotenv').config();

module.exports = {
    awsConfig: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    },
    IdentityPoolId: process.env.AWS_IDENTITY_POLL_ID,
    Logins: process.env.AWS_LOGINS,
};
