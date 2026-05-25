# Number of patterns

This is how many patterns ("unique local sequence per person") we counted for throws
of the given range, always excluding 0s, 1s and 3s.

For the full pattern list, see [P6.txt](/src/data/P6.txt) and
[P10.txt](/src/data/P10.txt).

Period 6:

- 2..9: 61
- 2..a: 85 (+24)
- 2..b: 131 (+46)

Period 10:

- 2..9: 1097
- 2..a: 1940 (+843)
- 2..b: 3597 (+1657)

P14:

- 2..b: ~33,000,000

## Script to calculate

To run from repo root.

```bash
for PATTERN_FILE in P6.txt P10.txt
do
  echo $PATTERN_FILE:
  cat src/data/$PATTERN_FILE | egrep "^[0-9]+$" | wc -l
  cat src/data/$PATTERN_FILE | egrep "^[0-9a]+$" | wc -l
  cat src/data/$PATTERN_FILE | egrep "^[0-9ab]+$" | wc -l
done
```
