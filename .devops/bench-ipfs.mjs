import { exec as originalExec } from 'child_process';
import { promisify } from 'util';
const exec = promisify(originalExec);

const { stdout: PROJECT_ROOT } = await exec(`git rev-parse --show-toplevel`);
// console.log(await exec(`env | grep GITPOD`));

const urls = [
  // 'http://127.0.0.1:5001/api/v0',
  // 'http://127.0.0.1:2214/api/v0',
  // 'http://127.0.0.1:1234/api/v0',
  'https://ipfs.anagolay.network/api/v0',
  'http://ipfs.anagolay.network:3000/api/v0'
  // 'https://2214-anagolay-microservices-ddt03vb6v45.ws-eu47.gitpod.io/api/v0'
  // 'https://5001-anagolay-microservices-ddt03vb6v45.ws-eu47.gitpod.io/api/v0',
  // 'https://5001-anagolay-microservices-ddt03vb6v45.ws-eu47.gitpod.io/api/v0',
  // 'https://1234-anagolay-microservices-ddt03vb6v45.ws-eu47.gitpod.io/api/v0',
  // 'https://1234-anagolay-microservices-ddt03vb6v45.ws-eu47.gitpod.io/api/v0'
];

if (!process.argv[2]) {
  console.error(' you must pass the path');
  process.exit(1);
}

const cmd = `ipfsCli-dev add ${PROJECT_ROOT.trim()}/${process.argv[2]}`;

console.log(`Executing ->`);
console.log(cmd);

try {
  const addedFiles = await Promise.all(
    urls.map(async (u) => {
      const { stdout } = await exec(cmd, {
        env: {
          ...process.env,
          AN_IPFS_API_URL: u
        }
      });

      if (!stdout) {
        return null;
      }

      return {
        url: new URL(u),
        // data: JSON.parse(stdout.trim())
        data: stdout.trim()
      };
    })
  );
  // console.log(addedFiles);

  const rrr = addedFiles.map((af) => {
    if (!af) return null;

    const { data, url } = af;

    const parsed = JSON.parse(data);

    return {
      url: url.hostname + ' - ' + (url.port || 80),
      cid: parsed.cid,
      size: parsed.size
    };
  });
  console.table(rrr);
} catch (error) {
  console.log(error);
}
