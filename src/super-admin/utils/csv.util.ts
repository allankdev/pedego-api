import { Parser } from 'json2csv';

export function generateCSV(data: any[]): string {
  const parser = new Parser();
  return parser.parse(data);
}