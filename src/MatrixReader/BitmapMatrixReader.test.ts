import { Readable } from "stream";
import { ReadableStreamBuffer } from "stream-buffers";
import Matrix from "../Matrix/Matrix";
import BitmapMatrixReader, { ENCODING } from "./BitmapMatrixReader";
import InvalidMatrixInputError from "./InvalidMatrixInputError";
import InvalidMatrixInputStreamError from "./InvalidMatrixInputStreamError";

describe("BitmapMatrixReader", () => {
    describe("read", () => {
        it("should return the correct matrices for a given input stream", async () => {
            const stdin = mockStream(Buffer.from(
                // Stream with two matrices and random trailing text
                "2\n1 1\n0\n2 4\n00\n01\n10\n11\nfoobar",
                ENCODING,
            ));

            const matrices = new Array<Matrix<boolean>>();
            const reader = new BitmapMatrixReader();
            await reader.read(stdin, (matrix: Matrix<boolean>) => {
                matrices.push(matrix);
            });

            expect(matrices.length).toBe(2);

            expect(matrices[0].getWidth()).toBe(1);
            expect(matrices[0].getHeight()).toBe(1);
            expect(matrices[0].getData()).toEqual([[false]]);

            expect(matrices[1].getWidth()).toBe(2);
            expect(matrices[1].getHeight()).toBe(4);
            expect(matrices[1].getData()).toEqual([
                [false, false],
                [false, true],
                [true, false],
                [true, true],
            ]);
        });

        it("should fail on missing numberOfMatrices", async () => {
            const stdin = mockStream(Buffer.from("", ENCODING));

            const onMatrixFn = jest.fn();
            const reader = new BitmapMatrixReader();

            await expect(reader.read(stdin, onMatrixFn))
                .rejects
                .toEqual(new InvalidMatrixInputStreamError(
                    "Reached end of the stream too early",
                ));
            expect(onMatrixFn).not.toHaveBeenCalled();
        });

        it("should fail on missing size", async () => {
            const stdin = mockStream(Buffer.from("1\n", ENCODING));

            const onMatrixFn = jest.fn();
            const reader = new BitmapMatrixReader();

            await expect(reader.read(stdin, onMatrixFn))
                .rejects
                .toEqual(new InvalidMatrixInputStreamError(
                    "Reached end of the stream too early",
                ));
            expect(onMatrixFn).not.toHaveBeenCalled();
        });

        it("should fail on missing matrix rows", async () => {
            const stdin = mockStream(Buffer.from("1\n1 2\n1\n", ENCODING));

            const onMatrixFn = jest.fn();
            const reader = new BitmapMatrixReader();

            await expect(reader.read(stdin, onMatrixFn))
                .rejects
                .toEqual(new InvalidMatrixInputStreamError(
                    "Reached end of the stream too early",
                ));
            expect(onMatrixFn).not.toHaveBeenCalled();
        });

        it("should fail on an incorrect numberOfMatrices", async () => {
            const stdin = mockStream(Buffer.from("foobar\n", ENCODING));

            const onMatrixFn = jest.fn();
            const reader = new BitmapMatrixReader();
            await expect(reader.read(stdin, onMatrixFn))
                .rejects
                .toEqual(new InvalidMatrixInputError("foobar", "<numberOfMatrices: number>"));
            expect(onMatrixFn).not.toHaveBeenCalled();
        });

        it("should fail on an incorrect matrix size", async () => {
            const stdin = mockStream(Buffer.from("1\na b\n", ENCODING));

            const onMatrixFn = jest.fn();
            const reader = new BitmapMatrixReader();

            await expect(reader.read(stdin, onMatrixFn))
                .rejects
                .toEqual(new InvalidMatrixInputError("a b", "<x: number> <y: number>"));
            expect(onMatrixFn).not.toHaveBeenCalled();
        });

        it("should fail on an incorrect matrix row", async () => {
            const stdin = mockStream(Buffer.from("1\n1 1\nfoobar\n", ENCODING));

            const onMatrixFn = jest.fn();
            const reader = new BitmapMatrixReader();

            await expect(reader.read(stdin, onMatrixFn))
                .rejects
                .toEqual(new InvalidMatrixInputError("foobar", "('0' | '1')+"));
            expect(onMatrixFn).not.toHaveBeenCalled();
        });

        it("should fail on an incorrect matrix row (invalid column count)", async () => {
            const stdin = mockStream(Buffer.from("1\n2 1\n1\n", ENCODING));

            const onMatrixFn = jest.fn();
            const reader = new BitmapMatrixReader();

            await expect(reader.read(stdin, onMatrixFn))
                .rejects
                .toEqual(new InvalidMatrixInputError("1", "to be of length 2"));
            expect(onMatrixFn).not.toHaveBeenCalled();
        });
    });
});

function mockStream(data: Buffer): Readable {
    const stream = new ReadableStreamBuffer({
        chunkSize: 20, // in bytes
        frequency: 10, // in milliseconds
    });
    stream.put(data);
    stream.stop();
    return stream;
}
