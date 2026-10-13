"use client";

import Image from "next/image";
import { ChevronDown, MoreHorizontal, PackageSearch } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface RecentOrder {
  id: string;
  trackingNo: string;
  productName: string;
  price: string;
  totalOrder: number;
  totalAmount: string;
  image?: string;
  bgColor?: string;
}

interface RecentOrdersProps {
  /** Real orders. When empty the table shows a labelled empty state. */
  orders?: RecentOrder[];
  title?: string;
  pendingMessage?: string;
}

const RecentOrders = ({
  orders = [],
  title = "Recent Orders",
  pendingMessage,
}: RecentOrdersProps) => {
  return (
    <div className="flex h-full w-full flex-col bg-surface rounded-2xl p-6 shadow-surface border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <button
          type="button"
          aria-label="Order list options"
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="font-medium text-muted-foreground text-sm">
              <div className="flex items-center gap-1.5 cursor-pointer select-none">
                Tracking no
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </TableHead>
            <TableHead className="font-medium text-muted-foreground text-sm">
              <div className="flex items-center gap-1.5 cursor-pointer select-none">
                Product Name
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </TableHead>
            <TableHead className="font-medium text-muted-foreground text-sm">
              <div className="flex items-center gap-1.5 cursor-pointer select-none">
                Price
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </TableHead>
            <TableHead className="font-medium text-muted-foreground text-sm text-center">
              <div className="flex items-center justify-center gap-1.5 cursor-pointer select-none">
                Total Order
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </TableHead>
            <TableHead className="font-medium text-muted-foreground text-sm text-right">
              Total Amount
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.length === 0 ? (
            <TableRow className="border-none hover:bg-transparent">
              <TableCell colSpan={5} className="py-10">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-surface-secondary text-muted-foreground">
                    <PackageSearch className="w-5 h-5" />
                  </span>
                  <p className="mt-3 text-sm font-medium text-foreground">No orders yet</p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                    {pendingMessage ??
                      "Your orders will appear here once the orders backend is available."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => (
              <TableRow
                key={order.id}
                className={`border-none ${
                  index % 2 !== 0 ? "bg-surface-secondary rounded-xl" : ""
                } hover:bg-surface-secondary transition-colors`}
              >
                {/* Tracking No */}
                <TableCell className="font-medium text-foreground py-4 rounded-l-xl">
                  {order.trackingNo}
                </TableCell>

                {/* Product Name with Thumbnail */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative w-10 h-10 rounded-lg ${
                        order.bgColor ?? "bg-primary-soft"
                      } flex items-center justify-center overflow-hidden shrink-0`}
                    >
                      {order.image ? (
                        <Image
                          src={order.image}
                          alt={order.productName}
                          fill
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <PackageSearch className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-foreground">
                      {order.productName}
                    </span>
                  </div>
                </TableCell>

                {/* Price */}
                <TableCell className="font-medium text-foreground py-4">
                  {order.price}
                </TableCell>

                {/* Total Order Badge */}
                <TableCell className="py-4 text-center">
                  <span className="inline-block bg-primary-soft text-primary font-semibold px-4 py-1.5 rounded-lg text-sm">
                    {order.totalOrder}
                  </span>
                </TableCell>

                {/* Total Amount */}
                <TableCell className="font-medium text-foreground text-right py-4 rounded-r-xl">
                  {order.totalAmount}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentOrders;
