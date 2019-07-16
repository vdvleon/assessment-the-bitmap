import Matrix from "../Matrix/Matrix";
import { createFromDistanceCalculator } from "./distanceToWhiteBitmapTransformer";
import manhattanDistanceCalculator from "./manhattanDistanceCalculator";

describe("distanceToWhiteBitmapTransformer", () => {
    describe("createFromDistanceCalculator", () => {
        it("should return a bitmap to number matrix transformer", () => {
            const transformer = createFromDistanceCalculator(manhattanDistanceCalculator);
            const input = new Matrix<boolean>(3, 5, false);
            input.setValueAt(0, 0, true);
            input.setValueAt(2, 4, true);

            const output = transformer(input);

            expect(output.getWidth()).toBe(3);
            expect(output.getHeight()).toBe(5);

            expect(output.getData()).toMatchSnapshot();
        });
    });
});
