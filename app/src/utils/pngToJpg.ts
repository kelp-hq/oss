import PngJs from 'png-js';
import JpgJs from 'jpeg-js';
import { PNG } from 'pngjs/browser';

export function convert(imageBuffer: Uint8Array) {
	const p = new PNG({ filterType: 4 }).parse(imageBuffer, function (error, data) {
		console.log(error, data);
		const jpegEncoded = JpgJs.encode({ data: data, width: data.width, height: data.height }, 100);
		console.log('jpegEncoded', jpegEncoded);
	});
}

export async function convertOld(
	imageBuffer: Uint8Array,
	opts: {
		quality: number;
	} = { quality: 100 }
) {
	const png = new PngJs(imageBuffer);
	const decodedPng = png.decode();
	const jpegEncoded = JpgJs.encode(
		{ data: decodedPng, width: png.width, height: png.height },
		opts.quality
	);

	return jpegEncoded.data;
}
