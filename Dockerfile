# use a node base image
FROM node:8

# set maintainer
LABEL maintainer "email@xdq.me"

RUN mkdir -p /app
RUN useradd -rm appDeploy
RUN chown -R appDeploy:appDeploy /app

USER appDeploy
WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/

RUN npm install --production && npm cache clean --force

USER root

RUN npm install pm2 -g && npm cache clean --force

COPY itemdb.xls /app/
COPY dist /app/dist/
RUN chown -R appDeploy:appDeploy /app

USER appDeploy

ENV PM2_PUBLIC_KEY ''
ENV PM2_SECRET_KEY ''
ENV coolq_host 'localhost'
ENV coolq_port '6700'
ENV coolq_access_token ''

CMD ["pm2-runtime", "dist/index.js"]