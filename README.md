# Assessment: The Bitmap

## Instructions

TODO

## Summary of the test

As described in the [test document](resources/Test_Backend_dott.pdf) for this
test I'm supposed to implement an CLI application (written using TypeScript)
that will read from *stdin* and write the result to *stdout*.

### Input

The input has the following format:

```
# Main definition:
<numberOfTests: int> # Amount of test cases
<n1: int> <m1: int>  # 'Columns' and 'rows' of the following bitmap
<bitmap1: Bitmap>    # A bitmap of size n1 x m1
...
<nN: int> <mN: int>  # Repeated depending of the value of numberOfTests
<bitmapN: Bitmap>

# Bitmap definition (depending of n and m)
<value(1,1): BitmapBoolean>...<value(n,1): BitmapBoolean>
...
<value(1,m): BitmapBoolean>...<value(n,m): BitmapBoolean>

# BitmapBoolean
'0'|'1'
```

The first line contains the amount of test cases we can expect from the stream.
Now for every expected test case we:
- first receive a line with it's size ('columns' x 'rows')
- followed by lines for every row where every character in the line represents
  a column. These characters have either the value `'0'` or `'1'`.

### Output

For every test case we need to output it's corresponding bitmap. However,
instead of outputting zeros and ones we output the distance of that coordinate
to an other 'white' (`'1'`) coordinate.

For this we need to use the Manhattan Distance formula:

```
# Point
(x, y)

# Formula
f(p1: Point, p2: Point) = |p1.x - p2.x| + |p2.y - p2.y|
```

## My approach

To ensure maintainability I want to structure the code in such a way the parts
can be easily swapped for other implementations.

Parts I'm thinking of:

- Input stream
- Output stream
- Main application
- Test case reader
  - Bitmap reader
- Bitmap transformer
  - The manhattan distance formula
- Bitmap writer
