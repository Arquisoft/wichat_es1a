module.exports = {
    setup_env : () => {
        process.env.REACT_APP_API_ENDPOINT = "http://localhost:3000";
        process.env.GATEWAY_SERVICE_API_ENDPOINT =  "http://localhost:8003";
    }
}
