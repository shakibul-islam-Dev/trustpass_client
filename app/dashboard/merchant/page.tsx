import CreateInvoice from "@/components/dashboard/CreateNewInvoice";
import InvoicePreview from "@/components/dashboard/InvoicePreview";
import RecentOrders from "@/components/dashboard/RecentOrders";

const MerchantDashboard = () => {
  return (
    <div>
      <RecentOrders />
      <InvoicePreview />
      <CreateInvoice />
    </div>
  );
};

export default MerchantDashboard;
