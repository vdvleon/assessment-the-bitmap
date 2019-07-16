import InvalidCoordinateError from "./InvalidCoordinateError";

export default class Bitmap<T> {
    private width: number;
    private height: number;
    private data: T[][];

    /**
     * Initialize a bitmap for a given size.
     *
     * @param width
     * @param height
     * @param initialValue
     */
    public constructor(width: number, height: number, initialValue: T) {
        this.width = width;
        this.height = height;
        this.data = [];

        // Initialize the 'matrix'
        for (let h = 0; h < height; ++h) {
            this.data[h] = [];
            for (let w = 0; w < width; ++w) {
                this.data[h][w] = initialValue;
            }
        }
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getData(): T[][] {
        return this.data;
    }

    public setValueAt(x: number, y: number, value: T): this {
        this.validateCoordinate(x, y);

        this.data[y][x] = value;

        return this;
    }

    public getValueAt(x: number, y: number): T {
        this.validateCoordinate(x, y);

        return this.data[y][x];
    }

    private validateCoordinate(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new InvalidCoordinateError(x, y, this.width, this.height);
        }
    }
}
