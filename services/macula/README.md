**Macula 👀**

- [Description](#description)
- [File caching and replication API](#file-caching-and-replication-api)
  - [Caching](#caching)
- [Image processing API](#image-processing-api)
  - [resize](#resize)
  - [flip](#flip)
  - [blur](#blur)
  - [sharpen](#sharpen)
  - [format](#format)

## Description

Macula is the image processing service and a IPFS gateway. With Macula users can resize images and do basic image manipulation like adding [blur](#blur), [sharpen](#sharpen), and select different image [format](#format). By default the rendition will always be generated, which is not what most users want, since it's slow and it's using lot of resources. To save on time and resources Macula allows users to `pin` their content on the IPFS node as they would do with any other file. This rendition can always be used in the future directly from the gateway without any processing. Even without the directly accessing the rendition from the gateway, it will be served via proxy and memory cache. Users can pass the `redirect` together with the `pin` to cache the rendition and do a `301` permanent redirect without any additional interaction.

Additionally users can process even further the rendition since they are already hosted on the IPFS. The rendition is always connected to the original image so users can trace back the usage and obtain the Licenses (future Anagolay and Kelp work).

## File caching and replication API

### Caching

Cache the rendition on the cache IPFS node for faster retrieval. The cache is enabled by writing `pin=1` in the url. This will use internal IPFS node which acts as a cache storage. By default the request will contain the header `x-kelp-cid-rendition` with the IPFS cid which you can use to directly access the rendition.

Params:

- `pin` only accepted to be value of `1`
- `redirect` only accepted to be value of `1`, will use `301` redirect

Not implemented functionality:

- `replicas` - how many replications of this rendition we need to make
- `account` - the account used for paying the fee

## Image processing API

**Headers**

- x-kelp-cid-rendition: bafybeiayzoor4zantvzdpow6tj2nmfziufjh63vyttdwzn4mlld7vymzt4 // rendition cid, it's different than IPFS cid if not stored on ipfs. wf is used if no cache
- x-kelp-cid-requested: bafybeib2ndnzufzkykaq4xziu3nekheoxc4lxt5nuiy6c2ouu7zmk2qiei // original cid of an requesting image
- x-kelp-stored-on-ipfs: true // only if `pin=1`

---

The items that have `param` empty are default setting and cannot be overwritten. The Sharp offers decent default which we are keeping. Each of the supported operations has a link to full docs. All the transformations are done via `SearchParams` or mostly known as `QueryParams`. Here is the list of supported operations.

### resize

Resize image to width, height or width x height. When both a width and height are provided, the **fit** is `cover`.

Full [Sharp documentation](https://sharp.pixelplumbing.com/api-resize#resize)

| name               | param | type   | defaultValue |
| ------------------ | ----- | ------ | ------------ |
| width              | w     | number |              |
| height             | h     | number |              |
| withoutEnlargement |       | number | true         |
| fit                |       | number | cover        |

### flip

Flip the image about the vertical Y axis. This always occurs after rotation, if any. The use of flip implies the removal of the EXIF Orientation tag, if any.

Full [Sharp documentation](https://sharp.pixelplumbing.com/api-operation#flip)

| name | param | type    | defaultValue |
| ---- | ----- | ------- | ------------ |
| flip | flip  | boolean | 1 or true    |

### blur

Blur the image.

When used without parameters, performs a fast 3x3 box blur (equivalent to a box linear filter).

When a sigma is provided, performs a slower, more accurate Gaussian blur.

Full [Sharp documentation](https://sharp.pixelplumbing.com/api-operation#blur)

| name | param | type   | defaultValue |
| ---- | ----- | ------ | ------------ |
| blur | blur  | number |              |

### sharpen

Sharpen the image. When used without parameters, performs a fast, mild sharpen of the output image. When a sigma is provided, performs a slower, more accurate sharpen of the L channel in the LAB colour space. Separate control over the level of sharpening in "flat" and "jagged" areas is available.

Full [Sharp documentation](https://sharp.pixelplumbing.com/api-operation#sharpen)

| name  | param   | sub-param | type   | defaultValue | example   |
| ----- | ------- | --------- | ------ | ------------ | --------- |
| sigma | sharpen | sigma     | number |              | `sigma:2` |
| m1    | sharpen | m1        | number | 1.0          | `m1:0`    |
| m2    | sharpen | m2        | number | 2.0          | `m2:3`    |
| x1    | sharpen | x1        | number | 2.0          | `x1:3`    |
| y2    | sharpen | y2        | number | 10           | `y2:15`   |
| y3    | sharpen | y3        | number | 20           | `y3:30`   |

### format

Blur the image.

When used without parameters, performs a fast 3x3 box blur (equivalent to a box linear filter).

When a sigma is provided, performs a slower, more accurate Gaussian blur.

Full [Sharp documentation](https://sharp.pixelplumbing.com/api-output#toformat)

| name | param | type   | defaultValue |
| ---- | ----- | ------ | ------------ |
| f    | blur  | number |              |
