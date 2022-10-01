# Kelp Digital Open Source Packages

**!!!! IMPORTANT !!!!**

All the packages, tools and services are licensed, some have the same license some do not. All rights apply based on the License for a given directory where the source code is located. The license in one package does not affect any other packages, it only affects the source code in the directory and all subdirectories where it is located and excluding the directories that contain the license file.

---

This repo contains the OSS from [Kelp Digital](https://kelp.digital):

## **Web3 API Auth Token ( WAAT )**

Important files:

- [README.md](./tools/web3-api-auth-token/README.md)
- [GPLv3 LICENSE](./tools/web3-api-auth-token/LICENSE)

Web3 API Auth Token (**WAAT**) defines a compact and self-contained way for securely transmitting information between the parties as a base64Url encoded JSON object. the information can be verified and trusted because it is digitally signed and the signature provided as a part of the token. WAAT is completely agnostic about the way the Strategies validate the payload. Because of this design approach, the WAAT is also agnostic about the RAW type of the signature and encourages the best practices for each Strategy.

## **Macula**

Important files:

- [README.md](./services/macula/README.md)
- [SSPL LICENSE](./services/macula/LICENSE)

The Macula is a missing layer for IPFS with built-in features like API authentication, on-the-fly image processing, secure file storage, and hosting for modern SPA or statically built websites. Macula App enables users to encrypt and decrypt files using the Substrate-based accounts and store them on the IPFS.

🏗️ The current set of features:

- Authenticated APIs using
  - API key strategy
  - web3 substrate-based account via Polkadot.js browser extension
- Access to IPFS native API on `macula.link/ipfs_api/`
- IPFS gateway served on `macula.link/ipfs/CID`
- Website hosting with CID or a subdomain
  - hosting specific version `https://bafybeiabw7h2j2wvpjzzi55oajj2yr3z7ifu2zfj2kpfefu2pulfljfx74.on.macula.link/`
  - hosting subdomain `https://test-website.macula.link/`
- SPA hosting with fully working refresh and HTML fallback page as a subdomain
- Statically build websites
  - if used with sveltekit Macula supported `precompress` feature and will serve Brotli compressed pages
- Gzip is enabled by default and Brotli only when requested
- highly efficient image processing based on Sharpjs via the URL search params
  - https://macula.kelp.digital/ipfs/bafybeic4fqttg2k6ibirqs57zcl3b2jd7hjnq22biyp542lfjhdyx5ausi/DSC02764.jpg?w=1000&h=400
- Ready-made `Caddyfile` with rewrites for non-docker environments
- Ready-made `docker-compose.yml` with rewrites for docker environment

With Macula, users can have truly versioned websites and monitor how they performed and developed.

## **Macula CLI for IPFS**

Important files:

- [README.md](./tools/ipfs-cli/README.md)
- [AGPLv3 LICENSE](./tools/ipfs-cli/LICENSE)

Custom-built CLI that can be used with the Macula authentication scheme to upload files directly to the IPFS without using the remote pinning service. It's using the HTTP API as defined in the IPFS documentation. Besides uploading the files, the Macula CLI is used to publish the websites to the Macula service register the subdomains and add the website version to it.

## **sveltekit adapter for macula**

Important files:

- [README.md](./tools/sveltekit-adapter-macula/README.md)
- [AGPLv3 LICENSE](./tools/sveltekit-adapter-macula/LICENSE)

Plainly put, Svelte is awesome! For that reason, we are supporting it first and also because we are using it. This adapter will create a `.macula/macula.json` file which contains everything that is needed to properly serve the website.
[Here](https://bafybeihonkvcaf5riqp6figuoe7l2nxrc6w3spnrqlioviabkda46k4ffe.ipfs.anagolay.network/macula.json) is an example of macula.json for the [static website](https://bafybeihonkvcaf5riqp6figuoe7l2nxrc6w3spnrqlioviabkda46k4ffe.ipfs.anagolay.network).

As you can see that some of the statically built websites you can already use with properly configured IPFS node, unfortunately, ipfs on anagolay.network does not have macula installed and will never gzip nor optimize the responses.

## About us

Kelp Digital is a company that is building next-generation software for content creators in the web3 ecosystem. Check us out on [kelp.digital](https://kelp.digital] and connect with us on [Twitter](https://twitter.com/kelp_digital) and on [Discord](https://discordapp.com/invite/fanBk5deyq)
