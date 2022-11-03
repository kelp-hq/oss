# notes

Encryption of the files with Polkadot extension

- https://github.com/polkadot-js/common/issues/633
- https://github.com/polkadot-js/common/issues/929
- https://polkadot.js.org/docs/util-crypto/examples/encrypt-decrypt/

## To Upload to macula

```sh

 export AN_IPFS_AUTH_METHOD=bearer
 export AN_IPFS_API_KEY=my.waat.value
 export AN_IPFS_API_URL=https://3000-kelpdigital-oss-ho9j4wluaxj.ws-eu73.gitpod.io/ipfs_api/v0

 node --no-experimental-fetch ../tools/ipfs-cli/lib/start.js macula addVersion .macula
 pnpm upload
```
