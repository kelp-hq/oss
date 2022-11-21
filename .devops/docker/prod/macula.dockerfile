FROM docker.io/node:18.4.0-bullseye-slim as base

ENV PNPM_HOME="$HOME/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
  curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | apt-key add - && \
  echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
  apt-get update && \
  apt-get -y install doppler


# this is the v7.30.0
ADD https://ipfs.anagolay.network/ipfs/bafybeigpvp624p2ly2c44twyvalrwdzb5sehntwk3zzrvb4ht6qh56atha /usr/local/bin/pnpm

RUN chmod +x /usr/local/bin/pnpm
# smoke test
RUN pnpm --version \
  && node --version

WORKDIR /build

COPY . .

RUN node common/scripts/install-run-rush.js install \
  && node common/scripts/install-run-rush.js update \
  && node common/scripts/install-run-rush.js build --timeline --verbose --from @kelp_digital/macula \
  && mkdir deployment \
  && node common/scripts/install-run-rush.js deploy --overwrite --project @kelp_digital/macula --target-folder ./deployment/


# MAIN IMAGE FOR THE UPLOAD
FROM docker.io/node:18.4.0-bullseye-slim
LABEL maintainer="daniel@woss.io" 
LABEL description="Macula -- on-the-fly media processing service with PnP IPFS gateway"
LABEL "digital.kelp.vendor"="Kelp Digital"

# Install Doppler CLI
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
  curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | apt-key add - && \
  echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
  apt-get update && \
  apt-get -y install doppler

# Fetch and view secrets using "printenv". Testing purposes only!
# Replace "printenv" with the command used to start your app, e.g. "npm", "start"

COPY --from=base /usr/local/bin/pnpm /usr/local/bin/pnpm
RUN chmod +x /usr/local/bin/pnpm

ENV PNPM_HOME="$HOME/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

COPY --from=base /build/deployment /app

ENV PORT=3000

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=7s CMD curl -f http://127.0.0.1:$PORT/healthcheck || exit 1

CMD [ "doppler", "run", "--", "node", "/app/services/macula/lib/start.js" ]
