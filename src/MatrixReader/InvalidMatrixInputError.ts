
export default class InvalidMatrixInputError extends Error {
    constructor(line: string, expected: string) {
        super(`Invalid line received: '${line}' expected: ${expected}`);
    }
}
