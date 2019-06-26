// Mode :: "proxy" (default)
// ---

function debounce(fn) {
	var timer;
	return function () {
		var ctx=this, args=arguments;
		if (timer) clearTimeout(timer);
		timer = setTimeout(function () {
			fn.apply(ctx, args);
			timer = null;
		});
	};
}

export default function (obj, fn) {
	var cb = debounce(fn);
	var p = new Proxy(obj, {
		get: function (o, k) {
			return o[k];
		},
		set: function (o, k, v) {
			if (o[k] !== v) {
				o[k] = v;
				cb(o);
			}
			return true;
		}
	});
	fn(p);
	return p;
}
