import { Readable } from "stream";
import Matrix from "../Matrix/Matrix";
import IMatrixReader, { OnMatrixCallback } from "./IMatrixReader";
import InvalidMatrixInputError from "./InvalidMatrixInputError";
import InvalidMatrixInputStreamError from "./InvalidMatrixInputStreamError";

export const ENCODING = "utf8";
export const NUMBER_OF_MATRICES_REGEX = /^\d+$/;
export const MATRIX_SIZE_REGEX = /^(\d+) (\d+)$/;
export const MATRIX_ROW_REGEX = /^[01]+$/;

export default class BitmapMatrixReader implements IMatrixReader<boolean> {
    private buffer?: Buffer;
    private numberOfMatrices?: number;
    private readedMatrices: number;
    private matrix?: Matrix<boolean>;
    private readedRows: number;

    public constructor() {
        this.reset();
    }

    /**
     * Reset the reader's state, making it reader for the next usage.
     */
    public reset(): void {
        this.buffer = null;
        this.numberOfMatrices = null;
        this.readedMatrices = 0;
        this.matrix = null;
        this.readedRows = 0;
    }

    /**
     * Read a stream of matrices and pass them to the onMatrixCallback.
     *
     * When ready or when an error occurred, the stream will be closed.
     *
     * @param stream
     * @param onMatrixCallback
     * @return Promise resulting into true or false (success or not)
     */
    public read(
        stream: Readable,
        onMatrixCallback: OnMatrixCallback<boolean>,
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let finished = false;

            stream.on("data", async (data: Buffer) => {
                if (finished) {
                    return;
                }

                try {
                    if (!this.buffer) {
                        this.buffer = data;
                    } else {
                        this.buffer = Buffer.concat([this.buffer, data]);
                    }

                    if (await this.parseBuffer(onMatrixCallback)) {
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
                    reject(new InvalidMatrixInputStreamError(
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
     * Parses the current buffer. When readed all matrices it will return true.
     *
     * @param onMatrixCallback
     * @return Ready or not
     */
    private async parseBuffer(onMatrixCallback: OnMatrixCallback<boolean>): Promise<boolean> {
        if (this.numberOfMatrices === null && !this.parseNumberOfMaxtrices()) {
            return false;
        }

        while (this.readedMatrices < this.numberOfMatrices) {
            if (this.matrix === null && !this.parseMatrixSize()) {
                return false;
            }

            while (this.readedRows < this.matrix.getHeight()) {
                if (!this.parseMatrixRow()) {
                    return false;
                }
            }

            if (this.readedRows === this.matrix.getHeight()) {
                await onMatrixCallback(this.matrix);

                this.matrix = null;
                this.readedRows = 0;
                ++this.readedMatrices;
            }
        }

        return true;
    }

    /**
     * Return the number of matrices to read from the stream.
     *
     * @return Could parse the number of matrices
     */
    private parseNumberOfMaxtrices(): boolean {
        const line = this.popLineFromBuffer();
        if (!line) {
            return false;
        }

        if (!line.match(NUMBER_OF_MATRICES_REGEX)) {
            throw new InvalidMatrixInputError(line, "<numberOfMatrices: number>");
        }

        this.numberOfMatrices = parseInt(line, 10);

        return true;
    }

    /**
     * Parse the next matrix's size (if possible).
     *
     * @return Could parse a matrix size
     */
    private parseMatrixSize(): boolean {
        const line = this.popLineFromBuffer();
        if (!line) {
            return false;
        }

        const match = line.match(MATRIX_SIZE_REGEX);
        if (!match) {
            throw new InvalidMatrixInputError(line, "<x: number> <y: number>");
        }

        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);

        this.matrix = new Matrix<boolean>(width, height, false);

        return true;
    }

    /**
     * Parse a matrix row (if possible).
     *
     * @return Could parse a row
     */
    private parseMatrixRow(): boolean {
        const line = this.popLineFromBuffer();
        if (!line) {
            return false;
        }

        if (!line.match(MATRIX_ROW_REGEX)) {
            throw new InvalidMatrixInputError(line, "('0' | '1')+");
        }

        if (line.length !== this.matrix.getWidth()) {
            throw new InvalidMatrixInputError(
                line,
                `to be of length ${this.matrix.getWidth()}`,
            );
        }

        for (let i = 0; i < line.length; ++i) {
            this.matrix.setValueAt(i, this.readedRows, line.charAt(i) === "1");
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
