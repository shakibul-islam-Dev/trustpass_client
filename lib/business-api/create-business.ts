export interface ICreateBusinessData {
  business_name: string;
  category_id: string;
  description?: string;
  business_type?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  cover_url?: string;
  website_url?: string;
  address?: {
    address_line: string;
    city: string;
    district: string;
    division: string;
    postal_code: string;
    country: string;
  };
}

export const handleCreateBusiness = async (formData: ICreateBusinessData) => {
  try {
    const res = await fetch("https://trust-pass-server.vercel.app/api/v1/businesses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Better Auth cookie credentials pass korar jonno:
      credentials: "include", 
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to create business");
    }

    return data;
  } catch (error) {
    console.error("Business post error:", error);
    throw error;
  }
};