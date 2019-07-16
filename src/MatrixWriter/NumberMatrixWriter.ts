import AbstractMatrixWriter from "./AbstractMatrixWriter";

export default class NumberMatrixWriter extends AbstractMatrixWriter<number> {
    private infinitySymbol: string;

    public constructor(infinitySymbol: string = "∞") {
        super();
        this.infinitySymbol = infinitySymbol;
    }

    /**
     * Add support for a special infinity symbol.
     * @param value
     * @return number or infinity symbol
     */
    public valueToString(value: number): string {
        if (value === +Infinity) {
            return this.infinitySymbol;
        } else if (value === +Infinity) {
            return `-${this.infinitySymbol}`;
        } else {
            return `${value}`;
        }
    }
}
