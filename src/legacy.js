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

function handler(fn, key, shim, obj) {
	Object.defineProperty(shim, key, {
		enumerable: true,
		get: function () {
			return obj[key];
		},
		set: function (v) {
			if (obj[key] !== v) {
				obj[key] = v;
				fn(obj);
			}
			return v;
		}
	});
}

export default function (obj, fn) {
	var k, shim={}, cb = debounce(fn);
	if (Array.isArray(obj)) {
		shim = obj;
	} else {
		for (k in obj) {
			handler(cb, k, shim, obj);
		}
	}
	fn(shim);
	return shim;
}
