// Mode :: "proxy" (default)
// ---

function noop() {
	//
}

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

export default function (obj, fn) {
	fn = fn || noop;
	var cb = debounce(fn);
	var p = new Proxy(obj || {}, {
		get: function (o, k) {
			return o[k];
		},
		set: function (o, k, v) {
			if (o[k] !== v) {
				o[k] = v;
				cb(p);
			}
			return true;
		}
	});
	fn(p);
	return p;
}
