FROM node:20

COPY . /app
WORKDIR /app

#Install the dependencies
RUN npm install --omit=dev

ARG REACT_APP_IP="localhost"
ENV REACT_APP_IP=$IP

#Create an optimized version of the webapp
RUN npm run build
RUN npm install -g serve --production

#Execute npm run prod to run the server
CMD [ "npm", "run", "prod" ]
#CMD ["npm", "start"]
