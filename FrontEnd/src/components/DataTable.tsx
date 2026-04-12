import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
}: DataTableProps<T>) {
  // 🔥 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🔥 SORTING
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ✅ SORT DATA
  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;

    const valA = a[sortKey];
    const valB = b[sortKey];

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;

    return 0;
  });

  // ✅ PAGINATION LOGIC
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(start, start + itemsPerPage);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <Table>
        {/* 🔥 HEADER (CLICK TO SORT) */}
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className="font-semibold text-foreground cursor-pointer"
                onClick={() => {
                  if (sortKey === col.key) {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortKey(col.key);
                    setSortOrder("asc");
                  }
                }}
              >
                {col.header}
                {sortKey === col.key && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* 🔥 BODY */}
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((item, idx) => (
              <TableRow
                key={idx}
                className={onRowClick ? "cursor-pointer hover:bg-muted/30" : ""}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render
                      ? col.render(item, start + idx) // ✅ keeps correct global index
                      : item[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 🔥 PAGINATION UI */}
      <div className="flex justify-between items-center p-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </Button>

        <span className="text-sm">
          Page {currentPage} of {totalPages || 1}
        </span>

        <Button
          variant="outline"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default DataTable;