const IP = process.env.TEST == "true" ? "localhost" : "172.187.170.130";

module.exports = {
    IP,
    API_URL: `http://${IP}:8000`,
    LLM_URL: `http://${IP}:8003`,
}
