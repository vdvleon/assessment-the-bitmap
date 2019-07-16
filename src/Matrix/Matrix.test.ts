import Matrix from "./Matrix";

describe("Matrix", () => {
    describe("constructor", () => {
        it("should create a matrix with a given size", () => {
            const width = 2;
            const height = 3;
            const matrix = new Matrix<boolean>(width, height, false);

            expect(matrix.getData().length).toEqual(height);
            for (let h = 0; h < height; ++h) {
                expect(matrix.getData()[h].length).toEqual(width);
            }
        });

        it("should create a matrix of given type", () => {
            const matrix1 = new Matrix<string>(1, 1, "foobar");
            expect(typeof matrix1.getData()[0][0]).toBe("string");

            const matrix2 = new Matrix<number>(1, 1, 13.37);
            expect(typeof matrix2.getData()[0][0]).toBe("number");

            const matrix3 = new Matrix<Date>(1, 1, new Date(0));
            expect(matrix3.getData()[0][0]).toBeInstanceOf(Date);
        });
    });

    describe("setValueAt", () => {
        it("should fail when given an incorrect coordinate", () => {
            const matrix = new Matrix<boolean>(1, 1, false);
            expect(() => matrix.setValueAt(1, 1, true)).toThrow(Error);
        });

        it("should set value for a valid coordinate and return this", () => {
            const matrix = new Matrix<boolean>(1, 1, false);

            expect(matrix.setValueAt(0, 0, true)).toBe(matrix);
            expect(matrix.getData()[0][0]).toBe(true);
        });
    });

    describe("getValueAt", () => {
        it("should fail when given an incorrect coordinate", () => {
            const matrix = new Matrix<boolean>(1, 1, false);
            expect(() => matrix.getValueAt(1, 1)).toThrow(Error);
        });

        it("should get value for a valid coordinate", () => {
            const matrix = new Matrix<boolean>(1, 1, false);

            expect(matrix.getValueAt(0, 0)).toBe(false);

            matrix.setValueAt(0, 0, true);

            expect(matrix.getValueAt(0, 0)).toBe(true);
        });
    });

    describe("getRowData", () => {
       it("should return one row as array", () => {
           const matrix = new Matrix<boolean>(3, 1, false);
           matrix.setValueAt(1, 0, true);

           expect(matrix.getRowData(0)).toEqual([false, true, false]);
       });
    });
});
