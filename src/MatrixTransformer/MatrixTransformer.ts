import Matrix from "../Matrix/Matrix";

export type MatrixTransformer<I, O> = (input: Matrix<I>) => Matrix<O>;
