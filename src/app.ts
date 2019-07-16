import { Readable, Writable } from "stream";
import BitmapMatrixReader from "./MatrixReader/BitmapMatrixReader";
import { createFromDistanceCalculator } from "./MatrixTransformer/distanceToWhiteBitmapTransformer";
import manhattanDistanceCalculator from "./MatrixTransformer/manhattanDistanceCalculator";
import matrixStreamTransformer from "./MatrixStreamTransformer/MatrixStreamTransformer";
import NumberMatrixWriter from "./MatrixWriter/NumberMatrixWriter";

async function main(input: Readable, output: Writable, error: Writable) {
    const reader = new BitmapMatrixReader();
    const transformer = createFromDistanceCalculator(manhattanDistanceCalculator);
    const writer = new NumberMatrixWriter();
    const streamTransformer = matrixStreamTransformer(reader, transformer, writer);

    return streamTransformer(input, output, error);
}

main(process.stdin, process.stdout, process.stderr)
    .catch(err => {
        console.error(err);
    });
