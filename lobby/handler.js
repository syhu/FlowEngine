//
//  handler.js
//
//  main server logic
//

// put collections used here
SR.DB.useCollections(['test2']);

// a pool for all message handlers
var l_handlers = exports.handlers = {};
var l_checkers = exports.checkers = {};

//-----------------------------------------
// define handlers (format checkers and event handlers)
//
//-----------------------------------------

// counter that'll be reset upon reloading
var reset_counter = 0;

// counter that won't be reset upon script reloading
var l_states = SR.State.get('counters');

if (typeof l_states.counter === 'undefined')
	l_states['counter'] = 0;

// test event
l_checkers.HELLO_EVENT = {
	//name: 'string'
};

l_handlers.HELLO_EVENT = function (event) {
    
	// print some message
	LOG.debug('HELLO_EVENT has been called');
	LOG.warn(event);
	
	if (!event.data.age) {
		LOG.error('no age sent to HELLO_EVENT!', 'lobby');	
	}
	
	// increment counters
	reset_counter++;
	l_states['counter']++;
	
	var age = event.data.age ? parseInt(event.data.age) : 0;
	age = age + 10;
	
	// send back response
	event.done('HELLO_REPLY', {name: event.data.name, age: age, 中文: '中文也通!', 
							   reset_counter: reset_counter, persist_counter: l_states['counter']});
}

l_checkers.TEST_SERVER_PUSH = {
	channel:	'string'	
}

l_handlers.TEST_SERVER_PUSH = function (event) {
	LOG.warn(event);		
	var channel = event.data.channel;
	SR.Comm.publish(channel, {data: (event.data.msg || 'nothing sent')});
	event.done({err: 0, msg: 'data sent to ' + channel});
}

// test session
l_handlers.TEST_SESSION = function (event) {
    
	// print some message
	LOG.debug('TEST_SESSION called');
	LOG.warn(event);
	
	if (event.data.id)
		event.session['id'] = event.data.id;
	else
		LOG.warn('id: ' + event.session['id']);
	
	// do something..
	
	// send back response
	event.done('TEST_SESSION_REPLY', {result: true, msg: 'you can modify this', name: 'johnny'});
}

//
// system events
//

var l_person = {};

SR.Callback.onStart(function () {

	SR.DS.init({
		models: {
			'Person': {
				id:	'string', // 身份證字號
				uid:	'number', // 系統編號
				person_id:	'string', // 學員代碼
				RFID_id:	'string', // RFID 代碼
				basic: 'object', // 基本資料
				contact:	'object', // 連絡
				delete_time:	'number', // 刪除時間
				class_info:	'object', // 母班
				learning:	'object', // 淨智學經歷
				memo:	'object', // 備註
				intro:	'object', // 介紹人
				region:	'object', // 區域
				care_history:	'object', // 關懷記錄
			},	
		},
		caches: {
			'Person': {
				key: 'id',
				map: l_person
			},
		}
	}, function (err) {
		if (err) {
			LOG.error(err, l_name);
		}
		
		LOG.warn('l_person inited with size: ' + (Object.keys(l_person).length - 2));
		//LOG.warn(l_person);
	});

});

SR.Callback.onStop(function () {
	
});
