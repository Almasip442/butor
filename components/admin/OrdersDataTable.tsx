"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import type { OrderStatus } from "@/lib/types";

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Függőben" },
  { value: "confirmed", label: "Visszaigazolva" },
  { value: "processing", label: "Feldolgozás alatt" },
  { value: "shipped", label: "Kiszállítva" },
  { value: "delivered", label: "Kézbesítve" },
  { value: "cancelled", label: "Törölve" },
];

const statusColorMap: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

interface AdminOrder {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  shipping_name: string;
  users?: { full_name: string } | null;
}

interface OrdersDataTableProps {
  orders: AdminOrder[];
}

export function OrdersDataTable({ orders: initialOrders }: OrdersDataTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [isPending, startTransition] = useTransition();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('hu-HU', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));

  const handleStatusChange = (orderId: string, prevStatus: OrderStatus, newStatus: string) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o)
    );

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.success) {
        setOrders(prev =>
          prev.map(o => o.id === orderId ? { ...o, status: prevStatus } : o)
        );
        toast.error(result.error ?? 'Státusz frissítés sikertelen');
      } else {
        toast.success(`Státusz frissítve: ${statusOptions.find(s => s.value === newStatus)?.label}`);
      }
    });
  };

  return (
    <div className="rounded-md border bg-card w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rendelés</TableHead>
            <TableHead>Vásárló</TableHead>
            <TableHead>Dátum</TableHead>
            <TableHead>Összeg</TableHead>
            <TableHead>Státusz</TableHead>
            <TableHead className="text-right">Akciók</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                Nincsenek rendelések.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">
                  #{order.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  {order.users?.full_name ?? order.shipping_name}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {formatPrice(order.total_amount)}
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(newStatus) =>
                      handleStatusChange(order.id, order.status, newStatus)
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue>
                        <Badge
                          variant="outline"
                          className={statusColorMap[order.status]}
                        >
                          {statusOptions.find(s => s.value === order.status)?.label}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Részletek
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
