# wichat_es1a

[![Actions Status](https://github.com/arquisoft/wichat_es1a/workflows/Build/badge.svg)](https://github.com/arquisoft/wichat_es1a/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_es1a&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Arquisoft_wichat_es1a)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_es1a&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Arquisoft_wichat_es1a)
[![CodeScene Average Code Health](https://codescene.io/projects/65366/status-badges/average-code-health)](https://codescene.io/projects/65366)
[![CodeScene Hotspot Code Health](https://codescene.io/projects/65366/status-badges/hotspot-code-health)](https://codescene.io/projects/65366)
[![CodeScene System Mastery](https://codescene.io/projects/65366/status-badges/system-mastery)](https://codescene.io/projects/65366)
[![CodeScene general](https://codescene.io/images/analyzed-by-codescene-badge.svg)](https://codescene.io/projects/65366)

<p float="left">
<img src="https://blog.wildix.com/wp-content/uploads/2020/06/react-logo.jpg" height="100">
<img src="https://miro.medium.com/max/365/1*Jr3NFSKTfQWRUyjblBSKeg.png" height="100">
</p>

**This project is based on last year's wiq_es04a**

Original repo: <https://github.com/Arquisoft/wiq_es04a>

Original authors:
- Méndez Fernández, Hugo
- Barrero Cruz, Pablo
- Lago Conde, Alberto
- García-Ovies Pérez, Pablo
- Bustamante Larriet, Samuel
- González García, María Teresa
- Andina Pailos, Daniel

Their code is imported on commit **87c3561**.

All development after that is made by us (wichat_es1a)

▪️ Participants👥:

- Andrea Fuertes Carral (**UO276299**). 
- Sara Inés Bolado (**UO277494**). 
- Pablo Pérez Saavedra (**UO288816**). 
- Saúl Valdelvira Iglesias (**UO283685**). 
- Alejandro Aldea Viana (**UO293873**). 

This is a base project for the Software Architecture course in 2024/2025.
It is a basic application composed of several components.

- **User service**. Express service that handles the insertion of new users in the system.
- **LLM service**. Express service that handles the communication with the LLM.
- **Gateway service**. Express service that is exposed to the public and serves as a proxy to the two previous ones.
- **Questions service**: Handles questions generation, using Wikidata.
- **Webapp**. React web application that uses the gateway service to allow basic login and new user features.

Both the user and auth service share a Mongo database that is accessed with mongoose.

## Quick start guide

First, clone the project:

```git clone git@github.com:arquisoft/wichat_es1a.git```

### LLM API key configuration

In order to communicate with the LLM integrated in this project, we need to setup an API key. Two integrations are available in this propotipe: gemini and empaphy. The API key provided must match the LLM provider used.

We need to create two .env files.
- The first one in the webapp directory (for executing the webapp using ```npm start```). The content of this .env file should be as follows:
```
REACT_APP_LLM_API_KEY="YOUR-API-KEY"
```
- The second one located in the root of the project (along the docker-compose.yml). This .env file is used for the docker-compose when launching the app with docker. The content of this .env file should be as follows:
```
LLM_API_KEY="YOUR-API-KEY"
```

Note that these files must NOT be uploaded to the github repository (they are excluded in the .gitignore).

An extra configuration for the LLM to work in the deployed version of the app is to include it as a repository secret (LLM_API_KEY). This secret will be used by GitHub Action when building and deploying the application.


### Launching Using docker
For launching the propotipe using docker compose, just type:
```docker compose --profile dev up --build```

### Component by component start
First, start the database. Either install and run Mongo or run it using docker:

```docker run -d -p 27017:27017 --name=my-mongo mongo:latest```

You can use also services like Mongo Altas for running a Mongo database in the cloud.

Now launch the auth, user and gateway services. Just go to each directory and run `npm install` followed by `npm start`.

Lastly, go to the webapp directory and launch this component with `npm install` followed by `npm start`.

After all the components are launched, the app should be available in localhost in port 3000.

### Public APIS

The users and question APIs documentation is available at
- Users: https://app.swaggerhub.com/apis/asw-98d/users-service_api/
- Questions: https://app.swaggerhub.com/apis/asw-98d/questionservice-api/

### Continuous delivery (GitHub Actions)
Once we have our machine ready, we could deploy by hand the application, taking our docker-compose file and executing it in the remote machine. In this repository, this process is done automatically using **GitHub Actions**. The idea is to trigger a series of actions when some condition is met in the repository. The precondition to trigger a deployment is going to be: "create a new release". The actions to execute are the following:

![imagen](https://github.com/user-attachments/assets/7ead6571-0f11-4070-8fe8-1bbc2e327ad2)


As you can see, unitary tests of each module and e2e tests are executed before pushing the docker images and deploying them. Using this approach we avoid deploying versions that do not pass the tests.

The deploy action is the following:

```yml
deploy:
    name: Deploy over SSH
    runs-on: ubuntu-latest
    needs: [docker-push-userservice,docker-push-authservice,docker-push-llmservice,docker-push-gatewayservice,docker-push-webapp]
    steps:
    - name: Deploy over SSH
      uses: fifsky/ssh-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        user: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_KEY }}
        command: |
          wget https://raw.githubusercontent.com/arquisoft/wichat_es1a/master/docker-compose.yml -O docker-compose.yml
          docker compose --profile prod down
          docker compose --profile prod up -d --pull always
```

This action uses three secrets that must be configured in the repository:
- DEPLOY_HOST: IP of the remote machine.
- DEPLOY_USER: user with permission to execute the commands in the remote machine.
- DEPLOY_KEY: key to authenticate the user in the remote machine.

Note that this action logs in the remote machine and downloads the docker-compose file from the repository and launches it. Obviously, previous actions have been executed which have uploaded the docker images to the GitHub Packages repository.
