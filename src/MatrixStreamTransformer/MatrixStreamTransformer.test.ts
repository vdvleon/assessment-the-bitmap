import { Readable, Writable } from "stream";
import Matrix from "../Matrix/Matrix";
import IMatrixReader, {OnMatrixCallback} from "../MatrixReader/IMatrixReader";
import { MatrixTransformer } from "../MatrixTransformer/MatrixTransformer";
import IMatrixWriter from "../MatrixWriter/IMatrixWriter";
import matrixStreamTransformer from "./MatrixStreamTransformer";

describe("MatrixStreamTransformer", () => {
    it("should use the reader, transformer and writer", async () => {
        const reader = mockReader([
            new Matrix<boolean>(1, 1, false),
            new Matrix<boolean>(1, 1, true),
        ]);
        const transformer = mockTransformer();
        const writer = mockWriter();

        const streamTransformer = matrixStreamTransformer(reader, transformer, writer);
        await streamTransformer(new Readable(), new Writable(), new Writable());

        expect(reader.reset).toBeCalledTimes(1);
        expect(reader.read).toBeCalledTimes(1);

        expect(transformer).toBeCalledTimes(2);

        expect(writer.write).toBeCalledTimes(2);
        expect(writer.waitForQueueToFinish).toBeCalledTimes(1);
    });
});

function mockReader(matrices: Array<Matrix<boolean>>): IMatrixReader<boolean> {
    return {
        read: jest.fn(async (stream: Readable, onMatrix: OnMatrixCallback<boolean>) => {
            for (const matrix of matrices) {
                onMatrix(matrix);
            }
        }),
        reset: jest.fn(),
    };
}

function mockTransformer(): MatrixTransformer<boolean, number> {
    return jest.fn((bitmap: Matrix<boolean>): Matrix<number> => {
        const matrix = new Matrix<number>(bitmap.getWidth(), bitmap.getHeight(), 0);
        for (let y = 0; y < bitmap.getHeight(); ++y) {
            for (let x = 0; x < bitmap.getWidth(); ++x) {
                matrix.setValueAt(x, y, bitmap.getValueAt(x, y) ? (x * y) + 1 : 0);
            }
        }
        return matrix;
    });
}

function mockWriter(): IMatrixWriter<number> {
    return {
        waitForQueueToFinish: jest.fn(() => Promise.resolve()),
        write: jest.fn(),
    };
}
