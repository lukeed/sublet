const sublet = require('../dist');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async function () {
	let num = 0;

	const view = sublet({ hideDone:false, todos:[] }, state => {
		let { hideDone, todos } = state;
		let filtered = hideDone ? todos.filter(todo => !todo.done) : todos;

		console.log(`~> showing ${filtered.length} of ${todos.length}`);

		filtered.forEach((todo, idx) => {
			console.log(`${todo.done ? '☑︎' : '☐'} ${todo.text}`);
		});

		console.log(`~> render #${++num}`);
	});

	function toggle(idx) {
		view.todos = view.todos.map((x, i) => {
			if (i === idx) x.done = !x.done;
			return x;
		});
	}

	function add(text) {
		view.todos = view.todos.concat({ text, done:false });
	}

	// -- begin interactions

	await sleep(100);
	console.log('\n# Adding 3 items');
	add('eat');
	add('sleep');
	add('code');

	await sleep(100);
	console.log('\n# Toggle "sleep" task');
	toggle(1);

	await sleep(100);
	console.log('\n# Hide Completed');
	view.hideDone = true;

	await sleep(100);
	console.log('\n# Add 1 item');
	add('repeat!');
})();
