const IP = process.env.REACT_APP_IP || "localhost";

console.log("IP:", IP);
console.log(process.env.REACT_APP_IP);
console.log(process.env.CREATE_REACT_APP_IP);
module.exports = {
    IP,
    API_URL: `http://${IP}:8000`,
    LLM_URL: `http://${IP}:8003`,
}
