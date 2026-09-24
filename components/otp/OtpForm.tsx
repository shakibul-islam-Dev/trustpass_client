"use Client";

import { useState } from "react";

const OtpForm = () => {
  const [email, setEmail] = useState("");
  const handleEmail = () => {};
  const handleEmailSubmit = () => {};
  return (
    <div>
      <form onSubmit={handleEmailSubmit}></form>
      <input type="text" value={email} />
    </div>
  );
};

export default OtpForm;
