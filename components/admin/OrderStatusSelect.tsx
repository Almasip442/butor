"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: string) => {
    const prev = status;
    setStatus(newStatus as OrderStatus);

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.success) {
        setStatus(prev);
        toast.error(result.error ?? "Státusz frissítés sikertelen");
      } else {
        toast.success(
          `Státusz frissítve: ${statusOptions.find(s => s.value === newStatus)?.label}`
        );
      }
    });
  };

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-full" aria-label="Rendelés státuszának módosítása">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
