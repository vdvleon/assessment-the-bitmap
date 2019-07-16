import { Readable } from "stream";
import Matrix from "../Matrix/Matrix";

export type OnMatrixCallback<T> = (matrix: Matrix<T>) => void;

export default interface IMatrixReader<T> {
    /**
     * Reset internal state for receiving a stream of data (again).
     */
    reset(): void;

    /**
     * Read matrices from a readable stream.
     *
     * @param stream Stream without any encoding (will receive buffers)
     * @param onMatrixCallback Callback which will receive every parsed matrix
     */
    read(
        stream: Readable,
        onMatrixCallback: OnMatrixCallback<T>,
    ): Promise<void>;
}
