import { Readable } from "stream";
import Bitmap from "../Bitmap/Bitmap";
import IBitmapReader, { OnBitmapCallback } from "./IBitmapReader";
import InvalidBitmapInputError from "./InvalidBitmapInputError";
import InvalidBitmapInputStreamError from "./InvalidBitmapInputStreamError";

export const ENCODING = "utf8";
export const NUMBER_OF_BITMAPS_REGEX = /^\d+$/;
export const BITMAP_SIZE_REGEX = /^(\d+) (\d+)$/;
export const BITMAP_ROW_REGEX = /^[01]+$/;

export default class BooleanBitmapReader implements IBitmapReader<boolean> {
    private buffer?: Buffer;
    private numberOfBitmaps?: number;
    private readedBitmaps: number;
    private bitmap?: Bitmap<boolean>;
    private readedRows: number;

    public constructor() {
        this.reset();
    }

    /**
     * Reset the reader's state, making it reader for the next usage.
     */
    public reset(): void {
        this.buffer = null;
        this.numberOfBitmaps = null;
        this.readedBitmaps = 0;
        this.bitmap = null;
        this.readedRows = 0;
    }

    /**
     * Read a stream of bitmaps and pass them to the onBitmapCallback.
     *
     * When ready or when an error occurred, the stream will be closed.
     *
     * @param stream
     * @param onBitmapCallback
     * @return Promise resulting into true or false (success or not)
     */
    public read(
        stream: Readable,
        onBitmapCallback: OnBitmapCallback<boolean>,
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let finished = false;

            stream.on("data", (data: Buffer): void => {
                if (finished) {
                    return;
                }

                try {
                    if (!this.buffer) {
                        this.buffer = data;
                    } else {
                        this.buffer = Buffer.concat([this.buffer, data]);
                    }

                    if (this.parseBuffer(onBitmapCallback)) {
                        stream.emit("close");
                        finished = true;
                        resolve(true);
                    }
                } catch (err) {
                    stream.emit("close");
                    finished = true;
                    reject(err);
                }
            });

            stream.on("end", (): void => {
                if (!finished) {
                    stream.emit("close");
                    finished = true;
                    reject(new InvalidBitmapInputStreamError(
                        "Reached end of the stream too early",
                    ));
                }
            });

            stream.on("error", (err) => {
                if (finished) {
                    return;
                }

                stream.emit("close");
                finished = true;
                reject(err);
            });
        });
    }

    /**
     * Parses the current buffer. When readed all bitmaps it will return true.
     *
     * @param onBitmapCallback
     * @return Ready or not
     */
    private parseBuffer(onBitmapCallback: OnBitmapCallback<boolean>): boolean {
        if (this.numberOfBitmaps === null && !this.parseNumberOfBitmaps()) {
            return false;
        }

        while (this.readedBitmaps < this.numberOfBitmaps) {
            if (this.bitmap === null && !this.parseBitmapSize()) {
                return false;
            }

            while (this.readedRows < this.bitmap.getHeight()) {
                if (!this.parseBitmapRow()) {
                    return false;
                }
            }

            if (this.readedRows === this.bitmap.getHeight()) {
                onBitmapCallback(this.bitmap);

                this.bitmap = null;
                this.readedRows = 0;
                ++this.readedBitmaps;
            }
        }

        return true;
    }

    /**
     * Return the number of bitmaps to read from the stream.
     *
     * @return Could parse the number of bitmaps
     */
    private parseNumberOfBitmaps(): boolean {
        const line = this.popLineFromBuffer();
        if (!line) {
            return false;
        }

        if (!line.match(NUMBER_OF_BITMAPS_REGEX)) {
            throw new InvalidBitmapInputError(line, "<numberOfBitmaps: number>");
        }

        this.numberOfBitmaps = parseInt(line, 10);

        return true;
    }

    /**
     * Parse the next bitmap's size (if possible).
     *
     * @return Could parse a bitmap size
     */
    private parseBitmapSize(): boolean {
        const line = this.popLineFromBuffer();
        if (!line) {
            return false;
        }

        const match = line.match(BITMAP_SIZE_REGEX);
        if (!match) {
            throw new InvalidBitmapInputError(line, "<x: number> <y: number>");
        }

        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);

        this.bitmap = new Bitmap<boolean>(width, height, false);

        return true;
    }

    /**
     * Parse a bitmap row (if possible).
     *
     * @return Could parse a row
     */
    private parseBitmapRow(): boolean {
        const line = this.popLineFromBuffer();
        if (!line) {
            return false;
        }

        if (!line.match(BITMAP_ROW_REGEX)) {
            throw new InvalidBitmapInputError(line, "('0' | '1')+");
        }

        if (line.length !== this.bitmap.getWidth()) {
            throw new InvalidBitmapInputError(
                line,
                `to be of length ${this.bitmap.getWidth()}`,
            );
        }

        for (let i = 0; i < line.length; ++i) {
            this.bitmap.setValueAt(i, this.readedRows, line.charAt(i) === "1");
        }

        ++this.readedRows;

        return true;
    }

    /**
     * Read and remove a not empty line from the current buffer.
     *
     * @return string|null
     */
    private popLineFromBuffer(): string|null {
        if (!this.buffer) {
            return null;
        }
        const str = this.buffer.toString(ENCODING);

        const index = str.indexOf("\n");
        if (index <= 0) {
            return null;
        }

        const line = str.substr(0, index);

        // Put the remaining buffer back
        if (str.length > (index + 1)) {
            this.buffer = Buffer.from(str.substr(index + 1), ENCODING);
        } else {
            this.buffer = null;
        }

        return line;
    }
}
