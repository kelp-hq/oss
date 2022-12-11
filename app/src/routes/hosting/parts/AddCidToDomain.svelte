<script lang="ts">
  import { polkadotAccountsStore, signViaExtension } from '@kelp_digital/svelte-ui-components/polkadot/store';
  import { type ISubstratePayload, SubstrateStrategy } from '@kelp_digital/web3-api-auth-token';
  import axios from 'axios';

  import { browser } from '$app/environment';

  const hostingAPIUrl = 'https://3000-kelpdigital-oss-ho9j4wluaxj.ws-eu73.gitpod.io/hosting/api';

  let websiteCid = 'bafybeigeurtsjr7scmhufyy5zxxgneexmow7rswfoucofyarhxtt6em4ba';
  let sendingRequest = false;
  let token: string[];
  let encodedToken: string;
  let encodedPayload: string;
  let sig: string;
  let errors: any;

  async function makeToken() {
    const tokenPayload: ISubstratePayload = {
      account: $polkadotAccountsStore.selectedAccount?.address as string,
      network: 'anagolay',
      prefix: 42
      // exp: 86400000
    };

    const t = new SubstrateStrategy(tokenPayload);
    encodedPayload = await t.encode();
    sig = await signViaExtension($polkadotAccountsStore.selectedAccount?.address as string, encodedPayload);

    encodedToken = await t.make(sig);

    token = decode(encodedToken);
    console.log('token valid?', await t.validate(encodedToken));
    window.localStorage.setItem('waat', encodedToken);
    return token;
  }

  async function addCid() {
    let tokenFromStorage;
    if (browser) {
      tokenFromStorage = window.localStorage.getItem('waat') || makeToken();
    } else {
      tokenFromStorage = makeToken();
    }

    sendingRequest = true;

    try {
      // just a smoke test before we call api

      const res = await axios.post(
        `${hostingAPIUrl}/addCid`,
        {
          ipfsCid: websiteCid
        },
        {
          headers: {
            Authorization: `Bearer ${tokenFromStorage}`
          }
        }
      );
      console.log(res);
      sendingRequest = false;
    } catch (error) {
      console.log(error);
      errors = [(error as any).message, (error as any).response.data];
    }
  }

  function decode(token: string) {
    return token.split('.').map((t) => atob(t));
  }
</script>

<div class="m-4 w-96 bg-primary text-primary-content shadow-xl rounded-md p-2">
  <h2 class="text-xl p-4">Add Cid to domain</h2>
  <div class="form-control p-4">
    <div class="input-group ">
      <input type="text" bind:value={websiteCid} placeholder="CID" class="input w-full" />
      <button
        on:click={addCid}
        class="btn  w-24 {sendingRequest ? 'loading' : ''} {websiteCid ? '' : 'btn-disabled'}">ADD</button
      >
    </div>
  </div>
</div>
{#if token}
  <div class="card bg-base-300 w-9/12">
    <div class="card-body">
      <h2 class="card-title">token debugger</h2>
      <div>
        <div>
          <h2 class="text">Token</h2>
          <textarea class="w-96 break-words">{encodedToken}</textarea>
        </div>
        <div>
          <h2 class="text">Payoad</h2>
          <textarea class="w-96 break-words">{encodedPayload}</textarea>
        </div>
        <div>
          <h2 class="text">Sig</h2>
          <textarea class="w-96 break-words">{sig}</textarea>
        </div>
        <div>
          <span>strategy: {token[0]}</span>
          <code>
            {JSON.stringify(JSON.parse(token[1]))}
          </code>
          <span>signature - {token[2]}</span>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if errors}
  <div class="mockup-code">
    <pre data-prefix="$"><code>{JSON.stringify(errors)}</code></pre>
  </div>
{/if}
