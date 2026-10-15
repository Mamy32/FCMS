import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  pageSize?: number;
  onRowClick?: (item: T) => void;
}

function DataTable<T extends { id?: string }>({
  columns,
  data,
  loading,
  error,
  emptyMessage = "No records found",
  pageSize = 15,
  onRowClick,
}: DataTableProps<T>) {
  const [requestedPage, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  // Stay on a valid page when filters shrink the data.
  const page = Math.min(requestedPage, pageCount - 1);

  const rows = data.slice(page * pageSize, (page + 1) * pageSize);

  const message = (text: string, tone = "text-muted-foreground") => (
    <TableRow>
      <TableCell colSpan={columns.length} className={`py-10 text-center ${tone}`}>
        {text}
      </TableCell>
    </TableRow>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.key} className={`whitespace-nowrap font-semibold text-foreground ${col.className || ""}`}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        <Skeleton className="h-4 w-full max-w-[140px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : error
                ? message(error.message, "text-destructive")
                : rows.length === 0
                  ? message(emptyMessage)
                  : rows.map((item, idx) => (
                      <TableRow
                        key={item.id ?? idx}
                        className={onRowClick ? "cursor-pointer" : ""}
                        onClick={() => onRowClick?.(item)}
                      >
                        {columns.map((col) => (
                          <TableCell key={col.key} className={`whitespace-nowrap ${col.className || ""}`}>
                            {col.render
                              ? col.render(item, page * pageSize + idx)
                              : ((item as Record<string, ReactNode>)[col.key] ?? "-")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
          </TableBody>
        </Table>
      </div>

      {!loading && data.length > pageSize && (
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
          <span>
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= pageCount - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
