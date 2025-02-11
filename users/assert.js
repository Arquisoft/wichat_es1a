function assert(expr, msg = "") {
    if (!expr)
        throw new Error(`Assertion failed: ${msg}`)
}

module.exports = assert;
