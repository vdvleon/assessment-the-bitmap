import Bitmap from './Bitmap';

describe('Bitmap', () => {
    describe('constructor', () => {
        it('should create a bitmap with a data matrix for given size', () => {
            const width = 2;
            const height = 3;
            const bitmap = new Bitmap<boolean>(width, height, false);

            expect(bitmap.data).toEqual(height);
            for (let h = 0; h < height; ++h) {
                expect(bitmap.data[h].length).toEqual(width);
            }
        });

        it('should create a bitmap with a data matrix of given type', () => {
            const bitmap1 = new Bitmap<string>(1, 1, 'foobar');
            expect(typeof bitmap1.data[0][0]).toBe('string');

            const bitmap2 = new Bitmap<number>(1, 1, 13.37);
            expect(typeof bitmap2.data[0][0]).toBe('number');

            const bitmap3 = new Bitmap<Date>(1, 1, new Date(0));
            expect(bitmap3.data[0][0]).toBeInstanceOf(Date);
        });
    });

    describe('setValueAt', () => {
       it('should fail when given an incorrect coordinate', () => {
          const bitmap = new Bitmap<boolean>(1, 1, false);
          expect(() => bitmap.setValueAt(1, 1, true)).toThrow(Error);
       });

        it('should set value for a valid coordinate and return this', () => {
            const bitmap = new Bitmap<boolean>(1, 1, false);

            expect(bitmap.setValueAt(0, 0, true)).toBe(bitmap);
            expect(bitmap.data[0][0]).toBe(true);
        });
    });

    describe('getValueAt', () => {
        it('should fail when given an incorrect coordinate', () => {
            const bitmap = new Bitmap<boolean>(1, 1, false);
            expect(() => bitmap.getValueAt(1, 1)).toThrow(Error);
        });

        it('should get value for a valid coordinate', () => {
            const bitmap = new Bitmap<boolean>(1, 1, false);

            expect(bitmap.getValueAt(0, 0)).toBe(false);

            bitmap.setValueAt(0, 0, true);

            expect(bitmap.getValueAt(0, 0)).toBe(true);
        });
    });
});
