"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, FileText, MoreHorizontal } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types";

interface OrdersDataTableProps {
  orders: Order[];
}

export function OrdersDataTable({ orders: initialOrders }: OrdersDataTableProps) {
  const [orders, setOrders] = useState(initialOrders);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('hu-HU', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const updateOrderStatus = (id: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus as any } : order
    ));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
      case 'processing': return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
      case 'shipped': return 'bg-purple-100 text-purple-800 hover:bg-purple-100/80';
      case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'Függőben';
      case 'processing': return 'Feldolgozás alatt';
      case 'shipped': return 'Szállítás alatt';
      case 'delivered': return 'Kiszállítva';
      case 'cancelled': return 'Törölve';
      default: return status;
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rendelés ID</TableHead>
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
            orders.map((order) => {
              const mockCustomer = "Kovács Anna"; 
              const truncatedId = order.id.split('-')[0] || order.id;
              
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium font-mono text-sm">
                    #{truncatedId}
                  </TableCell>
                  <TableCell>{mockCustomer}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell className="font-semibold">{formatPrice(order.total_amount)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2">
                      <Select 
                        defaultValue={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Függőben</SelectItem>
                          <SelectItem value="processing">Feldolgozás alatt</SelectItem>
                          <SelectItem value="shipped">Szállítás alatt</SelectItem>
                          <SelectItem value="delivered">Kiszállítva</SelectItem>
                          <SelectItem value="cancelled">Törölve</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge className={getStatusColor(order.status)} variant="outline">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menü megnyitása</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Műveletek</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Részletek
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Számla
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
