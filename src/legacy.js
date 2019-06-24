// Mode :: "legacy"
// ---

function debounce(fn) {
	var timer;
	return function () {
		var ctx=this, args=arguments;
		if (timer) clearTimeout(timer);
		timer = setTimeout(function () {
			fn.apply(ctx, args);
			timer = null;
		}, 1);
	};
}

function handler(fn, key, real, obj) {
	real[key] = obj[key];
	Object.defineProperty(obj, key, {
		get: function () {
			return real[key];
		},
		set: function (v) {
			if (real[key] !== v) {
				real[key] = v;
				fn(obj);
			}
			return v;
		}
	});
}

export default function (obj, fn) {
	var k, real={};
	var run = handler.bind(fn, debounce(fn));
	for (k in obj) run(k, real, obj);
	fn(obj);
	return obj;
}
