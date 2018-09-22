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
COPY itemdb.xls /app/
COPY dist /app/dist/

RUN npm install --production && npm cache clean --force

CMD [ "npm", "start" ]