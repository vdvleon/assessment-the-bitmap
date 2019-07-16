import { Writable } from "stream";
import Matrix from "../Matrix/Matrix";
import IMatrixWriter from "./IMatrixWriter";
import IValueToString from "./IValueToString";

export default abstract class AbstractMatrixWriter<T> implements IMatrixWriter<T>, IValueToString<T> {
    abstract valueToString(value: T): string;

    /**
     * Write a given matrix to an output stream.
     *
     * @param output
     * @param matrix
     */
    public async write(output: Writable, matrix: Matrix<T>): Promise<void> {
        for (let r = 0; r < matrix.getHeight(); ++r) {
            const line = matrix
                .getRowData(r)
                .map((value: T) => this.valueToString(value))
                .join(" ");

            await this.writeLineToStream(output, line);
        }
    }

    /**
     * Helper that writes a line to the stream and handles errors using a promise.
     *
     * @param stream
     * @param line
     */
    private writeLineToStream(stream: Writable, line: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            stream.write(`${line}\n`, (err?: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
