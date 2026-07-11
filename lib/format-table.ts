export interface TableColumn<T> {
  header: string;
  width?: number;
  align?: "left" | "right";
  render: (row: T) => string;
}

export interface FormatTableOptions {
  gap?: number;
}

function padCell(value: string, width: number, align: "left" | "right"): string {
  if (value.length >= width) {
    return value.slice(0, width);
  }

  const padding = " ".repeat(width - value.length);
  return align === "right" ? `${padding}${value}` : `${value}${padding}`;
}

export function formatTable<T>(
  rows: T[],
  columns: TableColumn<T>[],
  options: FormatTableOptions = {},
): string[] {
  const gap = options.gap ?? 2;
  const gapText = " ".repeat(gap);
  const widths = columns.map((column) => {
    const headerWidth = column.header.length;
    const dataWidth = rows.reduce((max, row) => Math.max(max, column.render(row).length), 0);
    return column.width ?? Math.max(headerWidth, dataWidth);
  });

  const formatRow = (cells: string[]) =>
    cells
      .map((cell, index) => padCell(cell, widths[index]!, columns[index]!.align ?? "left"))
      .join(gapText);

  const header = formatRow(columns.map((column) => column.header));
  const divider = formatRow(widths.map((width) => "─".repeat(width)));
  const body = rows.map((row) => formatRow(columns.map((column) => column.render(row))));

  return [header, divider, ...body];
}
