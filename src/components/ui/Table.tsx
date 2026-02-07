import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

const alignStyles = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead className={`bg-surface text-xs uppercase text-text-secondary ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={`divide-y divide-border ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = "", onClick, hoverable = true }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        ${hoverable ? "hover:bg-surface transition-colors" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "", align = "left" }: TableHeadProps) {
  return (
    <th className={`px-6 py-3 font-semibold ${alignStyles[align]} ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", align = "left" }: TableCellProps) {
  return (
    <td className={`px-6 py-4 ${alignStyles[align]} ${className}`}>
      {children}
    </td>
  );
}

// Empty state component for tables
export function TableEmpty({ message = "Aucune donnée", icon }: { message?: string; icon?: ReactNode }) {
  return (
    <tr>
      <td colSpan={100} className="px-6 py-12 text-center text-text-secondary">
        {icon && <div className="text-4xl mb-3 opacity-40">{icon}</div>}
        <p>{message}</p>
      </td>
    </tr>
  );
}
