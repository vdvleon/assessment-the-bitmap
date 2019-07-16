import { ICoordinate } from "./distanceToWhiteBitmapTransformer";

export default function manhattenDistanceCalculator(p1: ICoordinate, p2: ICoordinate): number {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}
