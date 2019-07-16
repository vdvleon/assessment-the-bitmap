import { Readable, Writable } from "stream";
import BitmapMatrixReader from "./MatrixReader/BitmapMatrixReader";
import { createFromDistanceCalculator } from "./MatrixTransformer/distanceToWhiteBitmapTransformer";
import manhattanDistanceCalculator from "./MatrixTransformer/manhattanDistanceCalculator";
import matrixStreamTransformer from "./MatrixStreamTransformer/MatrixStreamTransformer";
import NumberMatrixWriter from "./MatrixWriter/NumberMatrixWriter";

async function main(input: Readable, output: Writable) {
    const reader = new BitmapMatrixReader();
    const transformer = createFromDistanceCalculator(manhattanDistanceCalculator);
    const writer = new NumberMatrixWriter();
    const streamTransformer = matrixStreamTransformer(reader, transformer, writer);

    return streamTransformer(input, output);
}

main(process.stdin, process.stdout)
    .catch(err => {
        console.error(err);
    });
