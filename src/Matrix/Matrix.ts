import InvalidCoordinateError from "./InvalidCoordinateError";

export default class Matrix<T> {
    private width: number;
    private height: number;
    private data: T[][];

    /**
     * Initialize a matrix for a given size.
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

    /**
     * Get the complete row data (an array of T values).
     *
     * @param y Row index
     * @return Values for all columns in given row
     */
    public getRowData(y: number): T[] {
        return this.data[y];
    }

    /**
     * Set value at specific coordinate.
     *
     * @param x
     * @param y
     * @param value
     */
    public setValueAt(x: number, y: number, value: T): this {
        this.validateCoordinate(x, y);

        this.data[y][x] = value;

        return this;
    }

    /**
     * Get value at specific coordinate.
     *
     * @param x
     * @param y
     */
    public getValueAt(x: number, y: number): T {
        this.validateCoordinate(x, y);

        return this.data[y][x];
    }

    /**
     * Validate a coordinate to the size of the matrix.
     *
     * @param x
     * @param y
     */
    private validateCoordinate(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new InvalidCoordinateError(x, y, this.width, this.height);
        }
    }
}
