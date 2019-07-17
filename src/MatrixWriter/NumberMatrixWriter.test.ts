import { Writable } from "stream";
import Matrix from "../Matrix/Matrix";
import NumberMatrixWriter from "./NumberMatrixWriter";

describe("NumberMatrixWriter", () => {
    describe("queue logic", () => {
        it("should write every item added to the queue in the right order", async () => {
            const writer = new NumberMatrixWriter();

            const writeLogger = jest.fn(() => null);
            const stream = mockWritable(100, writeLogger);

            const errorLogger = jest.fn(() => null);
            const errorStream = mockWritable(1, errorLogger);

            writer.write(stream, errorStream, new Matrix<number>(1, 1, 1));
            writer.write(stream, errorStream, new Matrix<number>(1, 1, 2));
            writer.write(stream, errorStream, new Matrix<number>(1, 1, 3));
            writer.write(stream, errorStream, new Matrix<number>(1, 1, 4));

            // Not expected to start processing the queue right away
            expect(writeLogger).toHaveBeenCalledTimes(0);

            // Wait for the whole queue to finish
            await writer.waitForQueueToFinish();

            // Expect 4 calls in the right order
            expect(writeLogger.mock.calls).toEqual([
                ["1\n"],
                ["2\n"],
                ["3\n"],
                ["4\n"],
            ]);
        });

        it("should be blocked by waitForQueueToFinish when queue is not finished yet", async () => {
            const writer = new NumberMatrixWriter();

            const writeLogger = jest.fn(() => null);
            const stream = mockWritable(100, writeLogger);

            const errorLogger = jest.fn(() => null);
            const errorStream = mockWritable(1, errorLogger);

            writer.write(stream, errorStream, new Matrix<number>(1, 1, 1));
            writer.write(stream, errorStream, new Matrix<number>(1, 1, 2));
            writer.write(stream, errorStream, new Matrix<number>(1, 1, 3));
            writer.write(stream, errorStream, new Matrix<number>(1, 1, 4));

            // Not expected to start processing the queue right away
            expect(writeLogger).toHaveBeenCalledTimes(0);

            await wait(100);
            expect(writeLogger).toHaveBeenCalledTimes(1);

            await wait(100);
            expect(writeLogger).toHaveBeenCalledTimes(2);

            // Wait for the whole queue to finish
            await writer.waitForQueueToFinish();
            expect(writeLogger).toHaveBeenCalledTimes(4);
        });

        it("should write to the error stream when write errors occur", async () => {
            const writer = new NumberMatrixWriter();

            const writeLogger = jest.fn(() => new Error("foobar"));
            const stream = mockWritable(100, writeLogger);

            const errorLogger = jest.fn(() => null);
            const errorStream = mockWritable(1, errorLogger);

            writer.write(stream, errorStream, new Matrix<number>(1, 1, 1));
            await writer.waitForQueueToFinish();

            // Extra time for the error stream to flush
            await wait(200);

            expect(errorLogger).toHaveBeenCalledTimes(1);
            expect(errorLogger.mock.calls[0]).toEqual([new Error("foobar")]);
        });
    });
});

function wait(ms): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

function mockWritable(
    delayInMs: number,
    callback: (chunk: any) => Error|null,
): Writable {
    const stream = new Writable();
    stream.write = (chuck: any, cb): boolean => {
        setTimeout(
            () => {
                cb(callback(chuck));
            },
            delayInMs,
        );
        return true;
    };
    return stream;
}
