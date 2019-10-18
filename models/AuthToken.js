var keystone = require('keystone');
var Types = keystone.Field.Types;
var uuidv4 = require('uuid/v4');

var AuthToken = new keystone.List('AuthToken');

AuthToken.add({
	user_id: { type: Types.Relationship, ref: 'User', required: true, initial: true, noedit: true },
	token: { type: String, required: true, unique: true, index: true, noedit: true, default: uuidv4 },
});

AuthToken.register();
