export const ipfsOptions = {
	cidVersion: 1,
	wrapWithDirectory: true, // this is important when adding with the httpClient. it behaves differently than the cli where cli will wrap it in the name of the dir, this doesn't do that
	// hashAlg: "blake2b-256",
	// progress: (bytes: number, path?: string) => {
	//   log.info(`${path}`);
	// },
	// fileImportConcurrency: 1,
	pin: false
};

export async function createConnection() {
	const { create } = (await import('ipfs-http-client')).default;
	let ipfsApiUrl: string = 'http://localhost:3000/ipfs-api/v0';
	let headers = {};

	const opts = {
		url: ipfsApiUrl,
		headers
	};

	const ipfsClient = create(opts);

	return ipfsClient;
}

export async function addFileViaContent(content: Uint8Array, customOpts: any) {
	const ipfs = await createConnection();

	const ipfsFile = await ipfs.add(
		{
			path: '/',
			content
		},
		{
			...ipfsOptions,
			...customOpts
		}
	);

	return ipfsFile;
}
