var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, unique: true, index: true },
    password: { type: Types.Password, initial: true, required: true },
    nickname: { type: String, required: true, initial: true, unique: true, noedit: true },
    passwordHash: { type: String, required: true, initial: true, noedit: true },
    hint: { type: String, required: true, initial: true },
    adminLevel: { type: Number, default: 0 },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

User.relationship({ path: 'tokens', ref: 'AuthToken', refPath: 'user_id' });
User.relationship({ path: 'posts', ref: 'Post', refPath: 'user_id' });


/**
 * Registration
 */
User.defaultColumns = 'nickname, email, isAdmin';
User.register();
