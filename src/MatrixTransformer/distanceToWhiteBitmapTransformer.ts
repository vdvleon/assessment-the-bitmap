import Matrix from "../Matrix/Matrix";
import { MatrixTransformer } from "./MatrixTransformer";

export interface ICoordinate {
    x: number;
    y: number;
}

export type DistanceCalculator = (p1: ICoordinate, p2: ICoordinate) => number;

/**
 * Create a bitmap transformer that says for every 'coordinate' how far away it
 * is from an other 'coordinate' that is 'white' (true).
 *
 * @param distanceCalculator A function that calculates the distance between two coordinates.
 * @return MatrixTransformer from a boolean (bitmap) matrix to a number matrix
 */
export function createFromDistanceCalculator(
    distanceCalculator: DistanceCalculator,
): MatrixTransformer<boolean, number> {
    return (matrix: Matrix<boolean>): Matrix<number> => {
        // Find 'white' coordinates
        const whites = findCoordinatesForValue(matrix, true);

        // Create distance matrix
        const distanceBitmap = new Matrix<number>(
            matrix.getWidth(),
            matrix.getHeight(),
            0,
        );
        for (let y = 0; y < matrix.getHeight(); ++y) {
            for (let x = 0; x < matrix.getWidth(); ++x) {
                const distance = findClosestDistanceInList(
                    { x, y },
                    whites,
                    distanceCalculator,
                );
                distanceBitmap.setValueAt(x, y, distance);
            }
        }

        return distanceBitmap;
    };
}

/**
 * Helper to find closest distance of a coordinate to a coordinate in list.
 *
 * @param coordinate
 * @param coordinates
 * @param distance
 */
function findClosestDistanceInList(
    coordinate: ICoordinate,
    coordinates: ICoordinate[],
    distance: DistanceCalculator,
): number {
    return coordinates.reduce(
        (closestDistance, cor) =>
            Math.min(distance(coordinate, cor), closestDistance),
        +Infinity,
    );
}

/**
 * Find list of coordinates of which the value in the matrix matches a specific value.
 *
 * @param matrix
 * @param value
 * @return Coordinates
 */
function findCoordinatesForValue<T>(matrix: Matrix<T>, value: T): ICoordinate[] {
    const coordinates = new Array<ICoordinate>();

    for (let y = 0; y < matrix.getHeight(); ++y) {
        for (let x = 0; x < matrix.getWidth(); ++x) {
            if (matrix.getValueAt(x, y) === value) {
                coordinates.push({ x, y });
            }
        }
    }

    return coordinates;
}
