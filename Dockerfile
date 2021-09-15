FROM node:12.14.1-alpine AS builder
RUN apk add g++ make python

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
# build js & remove devDependencies from node_modules
RUN npm run build && npm prune --production


FROM node:alpine AS runner

ENV PORT=3000
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

# Migrations compiled while npm run build was call
# RUN rm -rf /app/dist/migrations/*.d.ts /app/dist/migrations/*.map
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/scripts/wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x wait-for.sh

EXPOSE 3000
ENTRYPOINT [ "node" ]
CMD [ "dist/main.js" ]
