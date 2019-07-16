import { Readable } from "stream";
import Bitmap from "../Bitmap/Bitmap";

export type OnBitmapCallback<T> = (bitmap: Bitmap<T>) => void;

export default interface IBitmapReader<T> {
    /**
     * Read bitmaps from a readable stream.
     *
     * @param stream Stream without any encoding (will receive buffers)
     * @param onBitmapCallback Callback which will receive every parsed bitmap
     * @return Promise resulting true (or an error)
     */
    read(
        stream: Readable,
        onBitmapCallback: OnBitmapCallback<T>,
    ): Promise<boolean>;
}
