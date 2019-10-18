var keystone = require('keystone');
var Types = keystone.Field.Types;

var Request = new keystone.List('Request');

Request.add({
	category: { type: Types.Select, required: true, initial: true, options: [
        { value: 'post', label: '게시글' },
        { value: 'album', label: '앨범' }
    ] },
    categoryName: { type: String, initial: true, required: true, unique: true, noedit: true },
    description: { type: Types.Text, initial: true, required: true, noedit: true },
    nickname: { type: String, initial: true, required: true, noedit: true },
    state: { type: Types.Select, require: true, initial: true, options: [
        { value: 'wait', label: '대기중' },
        { value: 'permitted', label: '승인됨' },
        { value: 'refused', label: '거절됨' }
    ] },
    requestTime: { type: Date, required: true, initial: true, noedit: true, default: Date.now },
});

Request.register();
