var keystone = require('keystone');
var Types = keystone.Field.Types;

var Category = new keystone.List('Category');

Category.add({
	category: { type: Types.Select, required: true, initial: true, options: [
        { value: 'post', label: '게시글' },
        { value: 'album', label: '앨범' },
    ] },
	categoryName: { type: String, initial: true, required: true, unique: true, noedit: true },
    creator: { type: String, initial: true, required: true, noedit: true },
    created: { type: Date, required: true, initial: true, noedit: true, default: Date.now },
});

Category.register();
