FROM node:20

COPY . /app
WORKDIR /app

#Install the dependencies
RUN npm install --omit=dev

ARG API_URI="http://localhost:8000"
ARG ONLINE_URI
ENV REACT_APP_MULTIPLAYER_ENDPOINT=$ONLINE_URI
ENV REACT_APP_API_ENDPOINT=$API_URI

#Create an optimized version of the webapp
RUN npm run build
RUN npm install -g serve --production

#Execute npm run prod to run the server
CMD [ "npm", "run", "prod" ]
#CMD ["npm", "start"]
