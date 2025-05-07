const IP = process.env.CREATE_REACT_APP_IP || "localhost";

module.exports = {
    IP,
    API_URL: `http://${IP}:8000`,
    LLM_URL: `http://${IP}:8003`,
}
