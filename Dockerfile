FROM node:12 as builder
WORKDIR /builder/
COPY package-lock.json package.json ./
RUN npm install
COPY gulpfile.js tsconfig.json ./
COPY src ./src
RUN npm run dist

FROM node:12-alpine
ENV NODE_ENV production
RUN mkdir -p /app
RUN addgroup -S appDeploy && adduser -S appDeploy -G appDeploy
RUN chown -R appDeploy:appDeploy /app
USER appDeploy
WORKDIR /app/
COPY --from=builder /builder/dist ./

ENV COOLQ_HOST ''
ENV COOLQ_PORT ''
ENV COOLQ_ACCESS_TOKEN ''
ENV DB_URL ''
ENV DATA_LOAD_CONCURRENT ''
CMD npm start