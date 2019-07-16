import { Readable, Writable } from "stream";
import Matrix from "../Matrix/Matrix";
import IMatrixReader from "../MatrixReader/IMatrixReader";
import {MatrixTransformer} from "../MatrixTransformer/MatrixTransformer";
import IMatrixWriter from "../MatrixWriter/IMatrixWriter";

/**
 * Returns a function takes an input and output stream.
 *
 * The function will read matrices from the input stream, puts it through a
 * transformer, and outputs them again to the output stream.
 *
 * @param reader
 * @param transformer
 * @param writer
 */
export default function matrixStreamTransformer<I, O>(
    reader: IMatrixReader<I>,
    transformer: MatrixTransformer<I, O>,
    writer: IMatrixWriter<O>,
) {
    return async (input: Readable, output: Writable): Promise<boolean> => {
        reader.reset();
        return reader.read(input, (bitmap: Matrix<I>): Promise<void> => {
            return writer.write(output, transformer(bitmap));
        });
    };
}
