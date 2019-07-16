
export default class InvalidBitmapInputError extends Error {
    constructor(line: string, expected: string) {
        super(`Invalid line received: '${line}' expected: ${expected}`);
    }
}
