import { Writable } from "stream";
import Matrix from "../Matrix/Matrix";

export default interface IMatrixWriter<T> {
    /**
     * Write a given matrix to an output stream.
     *
     * @param stream
     * @param errorStream Writable
     * @param matrix
     */
    write(stream: Writable, errorStream: Writable, matrix: Matrix<T>): void;

    /**
     * This function returns a promise that will resolve when the queue is finished.
     */
    waitForQueueToFinish(): Promise<void>;
}
