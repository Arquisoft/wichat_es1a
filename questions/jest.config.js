/** @type {import('ts-jest').JestConfigWithTsJest} **/

const testEnvironment =  "node";
const transform = { "^.+.tsx?$": ["ts-jest",{}] }

export {
    testEnvironment,
    transform
}
