import { Writable } from "stream";
import Matrix from "../Matrix/Matrix";
import IMatrixWriter from "./IMatrixWriter";
import IValueToString from "./IValueToString";

interface IMatrixOutputQueueItem<T> {
    stream: Writable;
    errorStream: Writable;
    matrix: Matrix<T>;
}

export default abstract class AbstractMatrixWriter<T> implements IMatrixWriter<T>, IValueToString<T> {
    private outputQueue: Array<IMatrixOutputQueueItem<T>>;
    private currentWorker?: Promise<void>;
    private queueFinishedResolver?: () => void;

    protected constructor() {
        this.outputQueue = new Array<IMatrixOutputQueueItem<T>>();
        this.currentWorker = null;
        this.queueFinishedResolver = null;
    }

    public abstract valueToString(value: T): string;

    public waitForQueueToFinish(): Promise<void> {
        if (this.queueFinishedResolver) {
            throw new Error("Can only waitForQueueToFinish once at a time");
        }

        if (this.outputQueue.length === 0) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
           this.queueFinishedResolver = resolve;
        });
    }

    /**
     * Write a given matrix to an output stream.
     *
     * This method works using a queue to prevent having to await a Promise in
     * the MatrixStreamTransformer.
     *
     * @param stream
     * @param errorStream
     * @param matrix
     */
    public write(stream: Writable, errorStream: Writable, matrix: Matrix<T>) {
        this.outputQueue.push({ stream, errorStream, matrix });
        this.workTheQueue();
    }

    /**
     * Queue worker, will invoke itself over and over.
     */
    private workTheQueue() {
        if (this.currentWorker) {
            return;
        } else if (this.outputQueue.length === 0) {
            // Notify the queue waiter that the queue is finished
            if (this.queueFinishedResolver) {
                this.queueFinishedResolver();
            }
            return;
        }

        const { stream, errorStream, matrix } = this.outputQueue.shift();

        // Output the matrix, when the job is done:
        // - reset the current worker
        // - continue the queue
        this.currentWorker = this.outputMatrix(stream, matrix)
            .catch((err) => {
                errorStream.write(err, () => {
                    // Couldn't write error message, hard abort
                    process.exit(1);
                });
            })
            .finally(() => {
                this.currentWorker = null;
                this.workTheQueue();
            });
    }

    /**
     * Output a matrix to the stream.
     *
     * @param stream
     * @param matrix
     */
    private async outputMatrix(stream: Writable, matrix: Matrix<T>) {
        for (let r = 0; r < matrix.getHeight(); ++r) {
            const line = matrix
                .getRowData(r)
                .map((value: T) => this.valueToString(value))
                .join(" ");

            await this.writeLineToStream(stream, line);
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
