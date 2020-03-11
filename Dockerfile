FROM node:12 as builder
WORKDIR /builder/
RUN npm config set registry https://repo.hzky.xyz/repository/npm/
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
COPY itemdb.xls /builder/dist ./

ENV KY_DCONENET_WEBSERVER_PORT ''
ENV KY_DCONENET_WEBSERVER_PREFIX ''
ENV KY_DCONENET_SENSOR_DATA_CACHE_TIME ''
ENV KY_DCONENET_NODEID ''
ENV KY_MQTT_CLIENTS ''
ENV KY_MQTTC_HOST ''
ENV KY_MQTTC_PORT ''
ENV KY_MQTTC_BASETOPIC ''
ENV KY_MQTTC_USERNAME ''
ENV KY_MQTTC_PASSWORD ''

EXPOSE 38001

CMD npm start