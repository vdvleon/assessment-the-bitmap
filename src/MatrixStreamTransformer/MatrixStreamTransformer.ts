import { Readable, Writable } from "stream";
import Matrix from "../Matrix/Matrix";
import IMatrixReader from "../MatrixReader/IMatrixReader";
import { MatrixTransformer } from "../MatrixTransformer/MatrixTransformer";
import IMatrixWriter from "../MatrixWriter/IMatrixWriter";

export type MatrixStreamTransformer = (input: Readable, output: Writable, error: Writable) => Promise<void>;

/**
 * Returns a function takes an input, output stream and error stream.
 *
 * The function will read matrices from the input stream, puts it through a
 * transformer, and outputs them again to the output stream.
 *
 * When a write error occurs errors will be written to the error stream.
 *
 * @param reader
 * @param transformer
 * @param writer
 */
export default function matrixStreamTransformer<I, O>(
    reader: IMatrixReader<I>,
    transformer: MatrixTransformer<I, O>,
    writer: IMatrixWriter<O>,
): MatrixStreamTransformer {
    return async (input: Readable, output: Writable, error: Writable): Promise<void> => {
        reader.reset();
        await reader.read(input, async (bitmap: Matrix<I>) => {
            writer.write(output, error, transformer(bitmap));
        });
        await writer.waitForQueueToFinish();
    };
}
