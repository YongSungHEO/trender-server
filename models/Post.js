var keystone = require('keystone');
var Types = keystone.Field.Types;

var Post = new keystone.List('Post');

Post.add({
    user_id: { type: Types.Relationship, ref:'User', required: true, initial: true, noedit: true },
    nickname: { type: String, required: true, initial: true, noedit: true },
    category: { type: Types.Select, required: true, initial: true, options: [
        { value: 'post', label: '게시글' },
        { value: 'album', label: '앨범' }
    ] },
	categoryName: { type: String, initial: true, required: true, unique: true, noedit: true },
    title: { type: String, initial: true, required: true, noedit: true },
    description: { type: Types.Text, initial: true, required: true, noedit: true },
    imageURL: { type: String, noedit: true },
    like: { type: Number, noedit: true, default: 0 },
    view: { type: Number, noedit: true, default: 0 },
    created: { type: Date, required: true, initial: true, noedit: true, default: Date.now },
});

Post.schema.add({
    reply: [{
        user_id: Object,
        nickname: String,
        content: String,
        created: Date
    }]
});

Post.register();
