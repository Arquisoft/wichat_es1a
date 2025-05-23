const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');

const app = express();
const port = 8000;

const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const questionGenerationServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8010';

app.use(cors());
app.use(express.json());

// Prometheus configuration
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

const handleErrors = (res, error) => {
  if (error.response && error.response.status) {
    res.status(error.response.status).json({ error: error.response.data.error });
  } else if (error.message) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

app.get('/ranking', async (req, res) => {
  try {
    const rankingUrL = new URL(`/user/ranking`, userServiceUrl)
    const response = await axios.get(rankingUrL.href);
    res.json(response.data); // Send just the response data
  } catch (error) {
    handleErrors(res, error);
  }
});

app.get('/profile', async (req, res) => {
  try {
    const username = req.query.username;
    const profileUrl = new URL(`/user/profile`, userServiceUrl);
    const response = await axios.get(profileUrl.href, {params: {username: username }});
    res.json(response.data.user);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.put('/profile/:username', async (req, res) => {
  try {
    const username = encodeURIComponent(req.params.username);
    const profileUrl = new URL(`/user/profile/${username}`, userServiceUrl);
    const response = await axios.post(profileUrl.href, req.body);
    res.json(response.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const loginUrl = new URL(`/login`, userServiceUrl);
    const authResponse = await axios.post(loginUrl.href, req.body);
    res.json(authResponse.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.get('/questionsRecord/:username/:gameMode', async (req, res) => {
  try {
    const username = encodeURIComponent(req.params.username);
    const gameMode = encodeURIComponent(req.params.gameMode);
    const questionsRecordUrl = new URL(`/user/questionsRecord/${username}/${gameMode}`, userServiceUrl);
    // Forward the user statics edit request to the user service
    const userResponse = await axios.get(questionsRecordUrl.href, req.body);
    res.json(userResponse.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.put('/questionsRecord', async (req, res) => {
  try {
    const questionsRecordUrl = new URL(`/user/questionsRecord`, userServiceUrl);
    const response = await axios.post(questionsRecordUrl.href, req.body);
    res.json(response.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.get('/user/group', async (req, res) => {
  try {
    const username = req.query.username;
    const userGroupUrl = new URL(`/user/group`, userServiceUrl);
    const userResponse = await axios.get(userGroupUrl.href, { params: { username: username } });
    res.json(userResponse.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.get('/user/:username', async (req, res) => {
  try {
    const username = encodeURIComponent(req.params.username);
    const userUrl = new URL(`/user/${username}`, userServiceUrl);
    const userResponse = await axios.get(userUrl.href);
    res.json(userResponse.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.get('/user', async (req, res) => {
  try {
    const userUrl = new URL(`/user/`, userServiceUrl);
    const response = await axios.get(userUrl.href);
    res.json(response.data); // Send just the response data
  } catch (error) {
    handleErrors(res, error);
  }
});

app.post('/user', async (req, res) => {
  try {
    const userUrl = new URL(`/user/`, userServiceUrl);
    const userResponse = await axios.post(userUrl.href, req.body);
    res.json(userResponse.data);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      res.status(400).json({ error: error.response.data.error });
    } else {
      handleErrors(res, error);
    }
  }
});

app.get('/questions/random/:n', async (req, res) => {
  try {
    const n = encodeURIComponent(req.params.n);
    const questionsUrl = new URL(`/questions/random/${n}`, questionGenerationServiceUrl);
    const questionsResponse = await axios.get(questionsUrl.href);
    res.send(questionsResponse.data);
  } catch (error) {
    const status = (error.response && error.response.status) ? error.response.status : 500;
    res.status(status).send({ error: error.message || 'Error fetching questions' });
  }
});

app.get('/questions/random/:category/:n', async (req, res) => {
  try {
    const category = encodeURIComponent(req.params.category);
    const n = encodeURIComponent(req.params.n);
    const username = req.query.username;
    const questionsUrl = new URL(`/questions/random/${category}/${n}`, questionGenerationServiceUrl);
    const questionsResponse = await axios.get(questionsUrl.href + `?username=${username}`);
    res.send(questionsResponse.data);
  } catch (error) {
    const status = (error.response && error.response.status) ? error.response.status : 500;
    res.status(status).send({ error: error.message || 'Error fetching questions' });
  }
});

app.put('/statistics', async (req, res) => {
  try {
    const statisticsUrl = new URL(`/user/statistics`, userServiceUrl);
    const userResponse = await axios.post(statisticsUrl.href, req.body);
    res.json(userResponse.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.get('/statistics/:username', async (req, res) => {
  try {
    const username = encodeURIComponent(req.params.username);
    const loggedUser = encodeURIComponent(req.query.loggedUser);
    const statisticsUrl = new URL(`/user/statistics/${username}`, userServiceUrl);
    const userResponse = await axios.get(statisticsUrl.href, { params: { loggedUser: loggedUser } });
    res.json(userResponse.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.get('/group/ranking', async (req, res) => {
  try {
    const groupRankingUrl = new URL(`/user/group/ranking`, userServiceUrl);
    const groupResponse = await axios.get(groupRankingUrl.href);
    res.json(groupResponse.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.post('/group', async (req, res) => {
  try {
    const groupUrl = new URL(`/user/group`, userServiceUrl);
    const userResponse = await axios.post(groupUrl.href, req.body);
    res.json(userResponse.data);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      res.status(400).json({ error: error.response.data.error });
    } else {
      handleErrors(res, error);
    }
  }
});

app.get('/group/:name', async (req, res) => {
  try {
    const name = encodeURIComponent(req.params.name);
    const username = encodeURIComponent(req.query.username);
    const groupUrl = new URL(`/user/group/${name}`, userServiceUrl);
    const userResponse = await axios.get(groupUrl.href, { params: { username: username } });
    res.json(userResponse.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.put('/group/:name', async (req, res) => {
  try {
    const name  = encodeURIComponent(req.params.name);
    const groupUrl = new URL(`/user/group/${name}`, userServiceUrl);
    const userResponse = await axios.post(groupUrl.href, req.body);
    res.json(userResponse.data);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      res.status(400).json({ error: error.response.data.error });
    } else {
      handleErrors(res, error);
    }
  }
});

app.put('/group/:name/exit', async (req, res) => {
  try {
    const name = encodeURIComponent(req.params.name);
    const groupExitUrl = new URL(`/user/group/${name}/exit`, userServiceUrl);
    const userResponse = await axios.post(groupExitUrl.href, req.body);
    res.json(userResponse.data);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      res.status(400).json({ error: error.response.data.error });
    } else {
      handleErrors(res, error);
    }
  }
});

// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = { app, server };
