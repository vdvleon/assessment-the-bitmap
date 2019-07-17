import { WritableStreamBuffer } from "stream-buffers";
import { join } from "path";
import { createReadStream } from "fs";
import main from "./main";

describe("main", () => {
    it("should write the correct output for the input", async () => {
        const inputStream = createReadStream(
            join(__dirname, "..", "resources", "exampleInput.txt")
        );
        const outputStream = new WritableStreamBuffer();
        const errorStream = new WritableStreamBuffer();

        await main(inputStream, outputStream, errorStream);

        expect(outputStream.getContentsAsString()).toMatchSnapshot();
        expect(errorStream.getContentsAsString()).toMatchSnapshot();
    });
});
