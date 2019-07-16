import { Readable } from "stream";
import { ReadableStreamBuffer } from "stream-buffers";
import Bitmap from "../Bitmap/Bitmap";
import BooleanBitmapReader, { ENCODING } from "./BooleanBitmapReader";
import InvalidBitmapInputError from "./InvalidBitmapInputError";
import InvalidBitmapInputStreamError from "./InvalidBitmapInputStreamError";

describe("BooleanBitmapReader", () => {
    describe("read", () => {
        it("should return the correct bitmaps for a given input stream", async () => {
            const stdin = mockStream(Buffer.from(
                // Stream with two bitmaps and random trailing text
                "2\n1 1\n0\n2 4\n00\n01\n10\n11\nfoobar",
                ENCODING,
            ));

            const bitmaps = new Array<Bitmap<boolean>>();
            const reader = new BooleanBitmapReader();
            await reader.read(stdin, (bitmap: Bitmap<boolean>) => {
                bitmaps.push(bitmap);
            });

            expect(bitmaps.length).toBe(2);

            expect(bitmaps[0].getWidth()).toBe(1);
            expect(bitmaps[0].getHeight()).toBe(1);
            expect(bitmaps[0].getData()).toEqual([[false]]);

            expect(bitmaps[1].getWidth()).toBe(2);
            expect(bitmaps[1].getHeight()).toBe(4);
            expect(bitmaps[1].getData()).toEqual([
                [false, false],
                [false, true],
                [true, false],
                [true, true],
            ]);
        });

        it("should fail on missing numberOfBitmaps", async () => {
            const stdin = mockStream(Buffer.from("", ENCODING));

            const onBitmapFn = jest.fn();
            const reader = new BooleanBitmapReader();

            await expect(reader.read(stdin, onBitmapFn))
                .rejects
                .toEqual(new InvalidBitmapInputStreamError(
                    "Reached end of the stream too early",
                ));
            expect(onBitmapFn).not.toHaveBeenCalled();
        });

        it("should fail on missing size", async () => {
            const stdin = mockStream(Buffer.from("1\n", ENCODING));

            const onBitmapFn = jest.fn();
            const reader = new BooleanBitmapReader();

            await expect(reader.read(stdin, onBitmapFn))
                .rejects
                .toEqual(new InvalidBitmapInputStreamError(
                    "Reached end of the stream too early",
                ));
            expect(onBitmapFn).not.toHaveBeenCalled();
        });

        it("should fail on missing bitmap rows", async () => {
            const stdin = mockStream(Buffer.from("1\n1 2\n1\n", ENCODING));

            const onBitmapFn = jest.fn();
            const reader = new BooleanBitmapReader();

            await expect(reader.read(stdin, onBitmapFn))
                .rejects
                .toEqual(new InvalidBitmapInputStreamError(
                    "Reached end of the stream too early",
                ));
            expect(onBitmapFn).not.toHaveBeenCalled();
        });

        it("should fail on an incorrect numberOfBitmaps", async () => {
            const stdin = mockStream(Buffer.from("foobar\n", ENCODING));

            const onBitmapFn = jest.fn();
            const reader = new BooleanBitmapReader();
            await expect(reader.read(stdin, onBitmapFn))
                .rejects
                .toEqual(new InvalidBitmapInputError("foobar", "<numberOfBitmaps: number>"));
            expect(onBitmapFn).not.toHaveBeenCalled();
        });

        it("should fail on an incorrect bitmap size", async () => {
            const stdin = mockStream(Buffer.from("1\na b\n", ENCODING));

            const onBitmapFn = jest.fn();
            const reader = new BooleanBitmapReader();

            await expect(reader.read(stdin, onBitmapFn))
                .rejects
                .toEqual(new InvalidBitmapInputError("a b", "<x: number> <y: number>"));
            expect(onBitmapFn).not.toHaveBeenCalled();
        });

        it("should fail on an incorrect bitmap row", async () => {
            const stdin = mockStream(Buffer.from("1\n1 1\nfoobar\n", ENCODING));

            const onBitmapFn = jest.fn();
            const reader = new BooleanBitmapReader();

            await expect(reader.read(stdin, onBitmapFn))
                .rejects
                .toEqual(new InvalidBitmapInputError("foobar", "('0' | '1')+"));
            expect(onBitmapFn).not.toHaveBeenCalled();
        });

        it("should fail on an incorrect bitmap row (invalid column count)", async () => {
            const stdin = mockStream(Buffer.from("1\n2 1\n1\n", ENCODING));

            const onBitmapFn = jest.fn();
            const reader = new BooleanBitmapReader();

            await expect(reader.read(stdin, onBitmapFn))
                .rejects
                .toEqual(new InvalidBitmapInputError("1", "to be of length 2"));
            expect(onBitmapFn).not.toHaveBeenCalled();
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
