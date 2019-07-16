import {ICoordinate} from "./distanceToWhiteBitmapTransformer";
import manhattenDistanceCalculator from "./manhattanDistanceCalculator";

describe("manhattenDistanceCalculator", () => {
    it("should return the right distance between two coordinates: 1", () => {
        const p1: ICoordinate = { x: 0, y: 0 };
        const p2: ICoordinate = { x: 2, y: 3 };

        expect(manhattenDistanceCalculator(p1, p2)).toBe(5);
    });

    it("should return the right distance between two coordinates: 2", () => {
        const p1: ICoordinate = { x: 0, y: 0 };
        const p2: ICoordinate = { x: 0, y: 3 };

        expect(manhattenDistanceCalculator(p1, p2)).toBe(3);
    });

    it("should return the right distance between two coordinates: 2", () => {
        const p1: ICoordinate = { x: 1, y: 0 };
        const p2: ICoordinate = { x: 3, y: 0 };

        expect(manhattenDistanceCalculator(p1, p2)).toBe(2);
    });

    it("should return the right distance between two coordinates: 3", () => {
        const p1: ICoordinate = { x: 0, y: 0 };
        const p2: ICoordinate = { x: 0, y: 0 };

        expect(manhattenDistanceCalculator(p1, p2)).toBe(0);
    });
});
