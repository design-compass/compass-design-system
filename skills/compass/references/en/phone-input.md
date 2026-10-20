# phone-input

## Do

- Distinguish the country calling code from the phone number and validate using country-specific formats.
- Support pasting international numbers and telephone autocomplete, separating display formatting from the stored value.

## Don't

- Do not impose the same length on every country or silently truncate local formats.
- Do not identify countries only by flags or reject an incomplete number before entry is finished.
