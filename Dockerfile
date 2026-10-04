FROM node:24-alpine
WORKDIR /app
COPY package.json server.mjs *.html *.md ./
COPY src ./src
COPY integrations ./integrations
RUN mkdir -p /app/data /app/uploads && chown -R node:node /app
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4173 DATA_DIR=/app/data
EXPOSE 4173
VOLUME ["/app/data", "/app/uploads"]
CMD ["node", "server.mjs"]
