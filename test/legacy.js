import test from 'tape';
import sublet from '../src/legacy';

const sleep = ms => new Promise(r => setTimeout(r, ms));

test('(legacy) exports', t => {
	t.is(typeof sublet, 'function', '~> a function');
	t.end();
});

test('(legacy) throws', t => {
	t.plan(6);

	try {
		sublet();
	} catch (err) {
		t.pass('Error when no `obj` provided');
		t.true(err instanceof TypeError, '~> TypeError'); // for function, but is okay
		t.true(err.message.includes('is not a function'), '~> with "not a function" message');
	}

	try {
		sublet({});
	} catch (err) {
		t.pass('Error when no `fn` provided');
		t.true(err instanceof TypeError, '~> TypeError');
		t.true(err.message.includes('is not a function'), '~> with "not a function" message');
	}
});

test('(legacy) setup', t => {
	t.plan(3);

	let num = 0;
	let src = { a:1 };
	let out = sublet(src, arg => {
		num++;
		t.same(arg, src, '~> receives the current state (Copy)');
	});

	t.same(out, src, 'returns the state (Copy)');
	t.is(num, 1, '(done) ran callback immediately');
});

test('(legacy) effects', t => {
	t.plan(3);

	let num = 0;
	let src = {};
	let out = sublet(src, arg => {
		arg.foo = 123;
		num++;
	});

	t.is(num, 1, '~> callback ran once');
	t.is(out.foo, 123, '~> Copy received value');
	t.is(src.foo, 123, '~> original received value');
});

test('(legacy) defers', async t => {
	t.plan(12);

	let num = 0;
	let src = { a:1 };
	let out = sublet(src, () => ++num);

	src.foo = 123;
	out.foobar = 456;

	t.is(num, 1, 'init complete');
	t.is(out.foo, 123, '~> Copy has `foo` key');
	t.is(out.foobar, 456, '~> Copy has `foobar` key');
	t.is(src.foo, 123, '~> original has `foo` key');
	t.is(src.foobar, 456, '~> original has `foobar` key');

	await sleep(3);

	out.a = 2;
	out.b = 3;
	out.c = 4;

	await sleep(3);

	t.is(num, 2, 'callback re-ran once');

	t.is(out.a, 2, '~> Copy received `a` value');
	t.is(out.b, 3, '~> Copy received `b` value');
	t.is(out.c, 4, '~> Copy received `c` value');

	t.is(src.a, 2, '~> original received `a` value');
	t.is(src.b, 3, '~> original received `b` value');
	t.is(src.c, 4, '~> original received `c` value');
});

test('(legacy) repeat value', async t => {
	t.plan(4);

	let num = 0;
	let src = { foo:123 };
	let out = sublet(src, () => ++num);

	t.is(num, 1, 'init complete');
	t.is(out.foo, 123, '~> Copy received value');
	t.is(src.foo, 123, '~> original received value');

	await sleep(5);
	out.foo = 123;
	await sleep(5);

	t.is(num, 1, 'did not re-run callback!');
});

// Note: Legacy can ONLY track existing keys!
test('(legacy) async mutation', t => {
	t.plan(5);

	let num = 0;
	let src = { foo:0, bar:0 };
	let out = sublet(src, arg => {
		num++;
		if (arg.foo) {
			t.is(num, 2, 're-ran callback');
			t.is(arg.foo, 123, '~> added "foo" after timeout!');
			setTimeout(() => {
				out.bar = 456;
				out.foo = false;
			}, 100); // via external
		} else if (arg.bar) {
			t.is(num, 3, 're-ran callback');
			t.is(arg.bar, 456, '~> added "bar" after timeout!');
		} else {
			// Runs on init
			setTimeout(() => arg.foo = 123, 100);
		}
	});

	t.is(num, 1, 'init complete');
});

// Note: Legacy can ONLY track existing keys!
test('(legacy) async callback', t => {
	t.plan(3);

	let num = 0;
	let src = { foo:0 };
	let out = sublet(src, async arg => {
		num++;
		if (arg.foo) {
			t.is(num, 2, 're-ran callback');
			t.is(arg.foo, 123, '~> added "foo" after timeout!');
		} else {
			// runs on init
			await sleep(3);
			out.foo = 123;
		}
	});

	t.is(num, 1, 'init complete');
});

// Note: Legacy DOES trigger with `src` changes
test('(legacy) original mutation', async t => {
	t.plan(4);

	let num = 0;
	let src = { a:1 };
	let out = sublet(src, () => ++num);
	t.is(num, 1, 'init complete');

	await sleep(3);
	src.a = 10;
	await sleep(3);

	t.is(num, 2, 'DID re-run callback!');
	t.is(src.a, 10, '~> updated original');
	t.is(out.a, 10, '~> updated Copy');
});

test('(legacy) operators :: Math', async t => {
	t.plan(19);

	let num = 0;
	let src = { foo:0 };
	let out = sublet(src, () => num++);
	t.is(num, 1, 'init complete');

	await sleep(3);
	out.foo += 10;
	await sleep(3);
	t.is(num, 2, '(+=) triggered callback');
	t.is(src.foo, 10, '(+=) ~> updated original');
	t.is(out.foo, 10, '(+=) ~> updated Copy');

	await sleep(3);
	out.foo++
	await sleep(3);
	t.is(num, 3, '(++) triggered callback');
	t.is(src.foo, 11, '(++) ~> updated original');
	t.is(out.foo, 11, '(++) ~> updated Copy');

	await sleep(3);
	out.foo--;
	await sleep(3);
	t.is(num, 4, '(--) triggered callback');
	t.is(src.foo, 10, '(--) ~> updated original');
	t.is(out.foo, 10, '(--) ~> updated Copy');

	await sleep(3);
	out.foo -= 5;
	await sleep(3);
	t.is(num, 5, '(-=) triggered callback');
	t.is(src.foo, 5, '(-=) ~> updated original');
	t.is(out.foo, 5, '(-=) ~> updated Copy');

	await sleep(3);
	out.foo *= 3;
	await sleep(3);
	t.is(num, 6, '(*=) triggered callback');
	t.is(src.foo, 15, '(*=) ~> updated original');
	t.is(out.foo, 15, '(*=) ~> updated Copy');

	await sleep(3);
	out.foo /= 5;
	await sleep(3);
	t.is(num, 7, '(/=) triggered callback');
	t.is(src.foo, 3, '(/=) ~> updated original');
	t.is(out.foo, 3, '(/=) ~> updated Copy');
});

test('(legacy) operators :: Array', async t => {
	t.plan(14);

	let num = 0;
	let src = { foo:[] };
	let out = sublet(src, () => num++);
	t.is(num, 1, 'init complete');

	await sleep(3);
	out.foo.push(123);
	await sleep(3);
	t.is(num, 1, '(push) did NOT trigger callback');
	t.is(src.foo.length, 1, '(push) ~> DID update original');
	t.is(out.foo.length, 1, '(push) ~> DID update Copy');

	await sleep(3);
	out.foo.pop();
	await sleep(3);
	t.is(num, 1, '(pop) did NOT trigger callback');
	t.is(src.foo.length, 0, '(pop) ~> DID update original');
	t.is(out.foo.length, 0, '(pop) ~> DID update Copy');

	await sleep(3);
	out.foo = out.foo.concat(123)
	await sleep(3);
	t.is(num, 2, '(concat) DID trigger callback');
	t.is(src.foo.length, 1, '(concat) ~> DID update original');
	t.is(out.foo.length, 1, '(concat) ~> DID update Copy');

	await sleep(3);
	out.foo[1] = 456;
	await sleep(3);
	t.is(num, 2, '([idx]) did NOT trigger callback');
	t.is(src.foo.length, 2, '([idx]) ~> DID update original');
	t.is(out.foo.length, 2, '([idx]) ~> DID update Copy');

	await sleep(3);
	out.foo = out.foo;
	await sleep(3);
	t.is(num, 2, '(self) did NOT trigger callback');
});

test('(legacy) operators :: String', async t => {
	t.plan(8);

	let num = 0;
	let src = { foo:'' };
	let out = sublet(src, () => num++);
	t.is(num, 1, 'init complete');

	await sleep(3);
	out.foo += 'foo';
	await sleep(3);
	t.is(num, 2, '(+=) DID trigger callback');
	t.is(src.foo, 'foo', '(+=) ~> DID update original');
	t.is(out.foo, 'foo', '(+=) ~> DID update Copy');

	await sleep(3);
	out.foo = out.foo.concat('bar');
	await sleep(3);
	t.is(num, 3, '(concat) DID trigger callback');
	t.is(src.foo, 'foobar', '(concat) ~> DID update original');
	t.is(out.foo, 'foobar', '(concat) ~> DID update Copy');

	await sleep(3);
	out.foo = out.foo;
	await sleep(3);
	t.is(num, 3, '(self) did NOT trigger callback');
});

// Note: Does not trigger callback
test('(legacy) target :: Array', async t => {
	t.plan(19);

	let num = 0;
	let src = [];
	let out = sublet(src, () => num++);
	t.is(num, 1, 'init complete');

	await sleep(3);
	out.push(1, 2, 3);
	await sleep(3);
	t.is(num, 1, '(push) did NOT trigger callback');
	t.is(src.length, 3, '(push) ~> DID update original');
	t.is(out.length, 3, '(push) ~> DID update Copy');

	await sleep(3);
	out.splice(1, 1);
	await sleep(3);
	t.is(num, 1, '(splice) did NOT trigger callback');
	t.is(src.length, 2, '(splice) ~> DID update original');
	t.is(out.length, 2, '(splice) ~> DID update Copy');

	await sleep(3);
	out.shift();
	await sleep(3);
	t.is(num, 1, '(shift) did NOT trigger callback');
	t.is(src.length, 1, '(shift) ~> DID update original');
	t.is(out.length, 1, '(shift) ~> DID update Copy');

	await sleep(3);
	out.unshift(5);
	await sleep(3);
	t.is(num, 1, '(unshift) did NOT trigger callback');
	t.is(src.length, 2, '(unshift) ~> DID update original');
	t.is(out.length, 2, '(unshift) ~> DID update Copy');

	await sleep(3);
	out.pop();
	await sleep(3);
	t.is(num, 1, '(pop) did NOT trigger callback');
	t.is(src.length, 1, '(pop) ~> DID update original');
	t.is(out.length, 1, '(pop) ~> DID update Copy');

	await sleep(3);
	out[1] = 12345;
	await sleep(3);
	t.is(num, 1, '([idx]) did NOT trigger callback');
	t.is(src.length, 2, '([idx]) ~> DID update original');
	t.is(out.length, 2, '([idx]) ~> DID update Copy');
});

// Note: Does not trigger callback
test('(legacy) target :: Array :: nested', async t => {
	t.plan(12);

	let num1 = 0;
	let src1 = [];
	let out1 = sublet(src1, () => num1++);
	t.is(num1, 1, '(1) init complete');

	let num2 = 0;
	let out2 = sublet(out1, () => num2++);
	t.is(num2, 1, '(2) init complete');

	await sleep(3);
	out2.push('hello');
	await sleep(3);

	t.is(num1, 1, '(1) did NOT trigger callback');
	t.is(num2, 1, '(2) did NOT trigger callback');
	t.is(src1.length, 1, '(2 -> 1) ~> DID update original');
	t.is(out1.length, 1, '(2 -> 1) ~> DID update Proxy');
	t.is(out2.length, 1, '(2 -> 1) ~> DID update Proxy');

	await sleep(3);
	out1.push('world');
	await sleep(3);

	t.is(num1, 1, '(1) did NOT trigger callback');
	t.is(num2, 1, '(2) did NOT trigger callback');
	t.is(src1.length, 2, '(1 -> src) ~> DID update original');
	t.is(out1.length, 2, '(1 -> src) ~> DID update Proxy');
	t.is(out2.length, 2, '(1 -> src) ~> DID update Proxy');
});

// Note: Legacy can ONLY track existing keys!
test('(legacy) target :: Object :: nested', async t => {
	t.plan(12);

	let num1 = 0;
	let src1 = { foo:null, bar:null };
	let out1 = sublet(src1, () => num1++);
	t.is(num1, 1, '(1) init complete');

	let num2 = 0;
	let out2 = sublet(out1, () => num2++);
	t.is(num2, 1, '(2) init complete');

	await sleep(3);
	out2.foo = 'hello';
	await sleep(3);

	t.is(num1, 2, '(1) DID trigger callback');
	t.is(num2, 2, '(2) DID trigger callback');
	t.is(src1.foo, 'hello', '(2 -> 1) ~> DID update original');
	t.is(out1.foo, 'hello', '(2 -> 1) ~> DID update Proxy');
	t.is(out2.foo, 'hello', '(2 -> 1) ~> DID update Proxy');

	await sleep(3);
	out1.bar = 'world';
	await sleep(3);

	t.is(num1, 3, '(1) DID trigger callback');
	t.is(num2, 2, '(2) did NOT trigger callback');
	t.is(src1.bar, 'world', '(1 -> src) ~> DID update original');
	t.is(out1.bar, 'world', '(1 -> src) ~> DID update Proxy');
	t.is(out2.bar, 'world', '(1 -> src) ~> DID update Proxy');
});
