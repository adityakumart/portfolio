/**
 * Represents the supported delimiters for CSV conversion.
 */
export type Delimiter = ',' | ';' | '\t';

/**
 * Represents the metadata for a conversion result.
 */
export interface ConversionMetadata {
  rows: number;
  cols: number;
}

/**
 * Handles CSV-specific characters within a field by quoting and escaping.
 * @param field The string to process.
 * @param delimiter The active delimiter.
 * @returns A CSV-safe field.
 */
function escapeCsvField(field: string, delimiter: Delimiter): string {
  // If the field contains the delimiter, a quote, or a newline, it needs to be wrapped in quotes.
  if (field.includes(delimiter) || field.includes('"') || field.includes('\n')) {
    // Escape any existing double quotes by doubling them up.
    const escapedField = field.replace(/"/g, '""');
    return `"${escapedField}"`;
  }
  return field;
}

/**
 * Converts a JSON string (array of objects) to a CSV string.
 * @param jsonString The JSON string to convert.
 * @param delimiter The delimiter to use.
 * @returns A tuple containing the CSV string and conversion metadata.
 */
export function jsonToCsv(jsonString: string, delimiter: Delimiter): [string, ConversionMetadata] {
  const jsonArray: Record<string, any>[] = JSON.parse(jsonString);
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
    return ['', { rows: 0, cols: 0 }];
  }

  // Collect all unique headers from all objects to handle inconsistencies.
  const headers = [...new Set(jsonArray.flatMap(obj => Object.keys(obj)))];

  const csvRows: string[] = [];
  // Add the header row.
  csvRows.push(headers.map(h => escapeCsvField(h, delimiter)).join(delimiter));

  // Add the data rows.
  jsonArray.forEach(obj => {
    const row = headers.map(header => {
      const value = obj[header] !== null && obj[header] !== undefined ? String(obj[header]) : '';
      return escapeCsvField(value, delimiter);
    });
    csvRows.push(row.join(delimiter));
  });

  const metadata: ConversionMetadata = {
    rows: jsonArray.length,
    cols: headers.length,
  };

  return [csvRows.join('\n'), metadata];
}

/**
 * Converts a CSV string to a JSON string (array of objects).
 * @param csvString The CSV string to convert.
 * @param delimiter The delimiter to use.
 * @returns A tuple containing the pretty-printed JSON string and conversion metadata.
 */
export function csvToJson(csvString: string, delimiter: Delimiter): [string, ConversionMetadata] {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) {
    return ['[]', { rows: 0, cols: 0 }];
  }

  const headers = lines[0].split(delimiter).map(h => h.trim());
  const jsonArray: Record<string, any>[] = [];

  // Regex to handle quoted fields, including those with escaped quotes.
  const csvRegex = new RegExp(`(,|\\n|^)("(?:(?:"")*[^"]*)*"|[^",\\n]*|\\n|$)`.replace(/,/g, delimiter), 'gi');

  for (let i = 1; i < lines.length; i++) {
    const obj: Record<string, any> = {};
    let match;
    let colIndex = 0;
    const line = lines[i];
    let lastIndex = 0;

    // This regex-based parser correctly handles quoted fields containing delimiters.
    while ((match = csvRegex.exec(line))) {
      if (colIndex >= headers.length) break;
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }
      obj[headers[colIndex++]] = value;
      lastIndex = csvRegex.lastIndex;
    }
    // Ensure all headers are present, even if the line is short
    for (let j = colIndex; j < headers.length; j++) {
      obj[headers[j]] = '';
    }
    jsonArray.push(obj);
  }

  const metadata: ConversionMetadata = { rows: jsonArray.length, cols: headers.length };
  return [JSON.stringify(jsonArray, null, 2), metadata];
}