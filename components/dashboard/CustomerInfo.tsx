'use client'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const invoices = [
  {
    invoice: "INV001",
    name: "John Doe",
    email: "john@example.com",
    date: "2026-03-01",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
  },
  {
    invoice: "INV002",
    name: "Jane Smith",
    email: "jane@example.com",
    date: "2026-03-02",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
  },
  {
    invoice: "INV003",
    name: "Robert Johnson",
    email: "robert@example.com",
    date: "2026-03-03",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
  },
  {
    invoice: "INV004",
    name: "Emily Davis",
    email: "emily@example.com",
    date: "2026-03-04",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
  },
  {
    invoice: "INV005",
    name: "Michael Brown",
    email: "michael@example.com",
    date: "2026-03-05",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
  },
  {
    invoice: "INV006",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    date: "2026-03-06",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
  },
  {
    invoice: "INV007",
    name: "David Taylor",
    email: "david@example.com",
    date: "2026-03-07",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
  },
]

export function CustomerInfo() {
  return (
    <section className="p-4">
      <div className="text-xl font-semibold mb-4">Invoice List</div>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statuts</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>{invoice.name}</TableCell>
              <TableCell>{invoice.email}</TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell className="text-right">{invoice.totalAmount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>Total</TableCell>
            <TableCell className="text-right">$2,250.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </section>
  )
}