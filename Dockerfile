# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS dev
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun build --packages=external --target=bun . --outdir build/

# copy production dependencies and source code into final image
FROM base AS release
USER bun

COPY --chown=bun --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/build/server/index.js .
COPY --from=prerelease /usr/src/app/package.json .

# run the app
EXPOSE 8080/tcp
ENTRYPOINT [ "bun", "index.js" ]
