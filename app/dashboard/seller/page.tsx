// import CreateInvoice from "@/components/dashboard/CreateNewInvoice";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
// import InvoicePreview from "@/components/dashboard/InvoicePreview";
import RecentOrders from "@/components/dashboard/RecentOrders";

const MerchantDashboard = () => {
  return (
    <div>
      <DashboardNavigation/>
      <RecentOrders />
      {/* <InvoicePreview /> */}
      {/* <CreateInvoice /> */}
    </div>
  );
};

export default MerchantDashboard;
