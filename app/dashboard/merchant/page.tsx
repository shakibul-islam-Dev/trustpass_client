import CreateInvoice from "@/components/dashboard/CreateNewInvoice";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import InvoicePreview from "@/components/dashboard/InvoicePreview";
import RecentOrders from "@/components/dashboard/RecentOrders";
import VerifyOtpPage from "@/components/otp/VerifyOtpPage";

const MerchantDashboard = () => {
  return (
    <div>
      <VerifyOtpPage/>
      <DashboardNavigation/>
      <RecentOrders />
      <InvoicePreview />
      <CreateInvoice />
    </div>
  );
};

export default MerchantDashboard;
