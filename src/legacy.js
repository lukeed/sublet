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
		});
	};
}

export default function (obj, fn) {
	var k, real = {};
	var cb = debounce(fn);

	for (k in obj) {
		real[k] = obj[k];
		Object.defineProperty(obj, k, {
			get: function () {
				return real[k];
			},
			set: function (v) {
				if (real[k] !== v) {
					real[k] = v;
					cb(obj);
				}
				return v;
			}
		});
	}

	fn(obj);
	return obj;
}
