const sublet = require('../dist');

const pause = () => new Promise(r => setTimeout(r, 1e3));

(async function () {
	const window = { width:1200, height:1024 };

	const viewport = sublet(window, state => {
		let { height, width, scrollHeight, zoom=1 } = state;

		console.log(`visible pixels: ${ width * height }`);
		console.log(`percent visible: ${ Math.round(height / (scrollHeight || height) * 100) }%`);
		console.log(`scale factor: ${ zoom }x`);
		console.log(`scaled pixels: ${ width * height * zoom }`);
	});

	await pause();
	console.log('\n~> changing width & scrollHeight');
	viewport.width = 1024;
	viewport.scrollHeight = 1600;

	await pause();
	console.log('\n~> changing height & zoom');
	viewport.height = 800;
	viewport.zoom = 1.25;
})();
