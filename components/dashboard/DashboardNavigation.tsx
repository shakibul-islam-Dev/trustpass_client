'use client'
import { usePathname } from "next/navigation";

const DashboardNavigation = () => {
    const pathName = usePathname()
    return (
        <div>
          <div>{pathName}</div>
          <div>search</div>
          <div>Date</div>  
            
        </div>
    );
};

export default DashboardNavigation;