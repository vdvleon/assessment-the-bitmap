
export default class InvalidCoordinateError extends Error {
    constructor(x: number, y: number, width: number, height: number) {
        super(`Invalid coordinate given: (${x}, ${y}) for bitmap of size ${width} x ${height}`);
    }
}
