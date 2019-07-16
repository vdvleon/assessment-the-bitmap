import { Writable } from "stream";
import Matrix from "../Matrix/Matrix";

export default interface IMatrixWriter<T> {
    /**
     * Write a given matrix to an output stream.
     *
     * @param output
     * @param matrix
     */
    write(output: Writable, matrix: Matrix<T>): Promise<void>;
}
