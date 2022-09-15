import PngJs from 'png-js';
import JpgJs from 'jpeg-js';

export async function convert(
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
