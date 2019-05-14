/* eslint-disable no-console */
const { promisify } = require('util');
const { execFile } = require('child_process');

const run = promisify(execFile);
const BIN = require.resolve('bundt');

async function group(name, toMove) {
	let { stdout } = await run(BIN, [`src/${name}.js`, '--minify']);

	process.stdout.write(`\nMode: "${name}"` + stdout);

	// UMD should be "default" for unpkg access
	// ~> needs "index.js" since no "unpkg" key config
	if (toMove) {
		await run('mv', ['dist/index.min.js', 'dist/index.js']);
		await run('mv', ['dist', name]);
	}
}

(async function () {
	// Build modes (order matters)
	await group('legacy', true);
	await group('proxy');
})().catch(err => {
	console.error('Caught: ', err);
	process.exit(1);
});
