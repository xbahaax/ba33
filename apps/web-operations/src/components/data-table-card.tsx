import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@ba33/ui-web";

export interface DataTableColumn<Row> {
  header: string;
  render: (row: Row) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableCardProps<Row> {
  title: string;
  description?: string;
  rows: Row[];
  columns: Array<DataTableColumn<Row>>;
  getRowKey: (row: Row) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTableCard<Row>({
  title,
  description,
  rows,
  columns,
  getRowKey,
  emptyMessage = "Aucune ligne disponible.",
  className,
}: DataTableCardProps<Row>) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex min-h-52 items-center justify-center px-6 py-10 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.header}
                    className={column.headerClassName}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={getRowKey(row)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.header}
                      className={column.cellClassName}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
