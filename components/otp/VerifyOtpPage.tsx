"use client";

import React from "react"
import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

const VerifyOtpPage = () => {
  const [otp,setOtp] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()


  const email = searchParams.get('email')
 const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log('Verification successful');
      router.push('/dashboard');
    } else {
      console.log(data, 'Invalid OTP or Error');
    }
  } catch (error) {
    console.error('OTP Verification Error:', error);
  }
};
  return (
   <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Verify OTP</h2>
      <p>Sent OTP to: <strong>{email}</strong></p>

      <form onSubmit={handleVerifyOtp}>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />
        <button type="submit" style={{ marginTop: '15px', display: 'block' }}>
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOtpPage;
