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

SR.API.add('GET_DOCUMENT', {
	form_id: 'string'
}, function (args, onDone) {
	if (l_documents.hasOwnProperty(args.form_id)) {
		onDone(null, l_documents[args.form_id].doc);
	} else {
		onDone('invalid form_id: ' + args.form_id);
	}
});

SR.API.add('LIST_DOCUMENT', function (args, onDone) {
	var list = Object.keys(l_documents);
	list.splice(list.indexOf('add'), 1);
	list.splice(list.indexOf('remove'), 1);
	
	onDone(null, list);
});

SR.API.add('SAVE_DOCUMENT', {
	doc: 'object'
}, function (args, onDone) {
	
	LOG.warn(args);
	
	l_documents.add({
		form_id: args.doc.content.form_id,
		doc: args.doc
	}, function (err, result) {
		if (err) {
			LOG.error(err);
			return onDone(err);
		}
		
		LOG.warn(l_documents);
		onDone(null, 'save success');
	})
	
})

//
// system events
//

var l_documents = {};

SR.Callback.onStart(function () {

	SR.DS.init({
		models: {
			'Document': {
				form_id:	'string',
				doc:		'object'
				//content: 	'object',
				//flow_list: 	'object'
			},	
		},
		caches: {
			'Document': {
				key: 'form_id',
				map: l_documents
			},
		}
	}, function (err) {
		if (err) {
			LOG.error(err, l_name);
		}
		
		LOG.warn('l_documents inited with size: ' + (Object.keys(l_documents).length - 2));
	});

});

SR.Callback.onStop(function () {
	
});
