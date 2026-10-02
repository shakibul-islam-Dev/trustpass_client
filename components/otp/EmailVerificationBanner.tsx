"use client"

import { CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { useState } from "react";

interface EmailVerificationProps{
    email:string,
    onResend?:()=>Promise<void> | void;
    onChangeEmail?:()=>void
}
const EmailVerificationBanner = ({email,onResend,onChangeEmail}:EmailVerificationProps) => {
    const[isSending,setSendig]=useState(false)
    const[sent,setSent] =useState(false)


    const handleResend = async()=>{
        if(!onResend ||isSending) return;
        try{
            setSendig(true)
            await onResend()
            setSent(true);

            setTimeout(()=>{
                setSent(false);
            },5000)
        }finally{
        setSendig(false)
    } 
    }
    const maskedEmail = email.replace( /^(.{2}).*(@.*)$/, "$1***$2" );
    return (
       <div className="flex min-h-screen items-center justify-center bg-background px-4">
         <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8"> {/* Icon */} 
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"> 
            <Mail className="h-8 w-8 text-primary" /> </div> {/* Heading */} <div className="text-center"> 
                <h1 className="text-2xl font-semibold tracking-tight"> Verify your email </h1> 
                <p className="mt-2 text-sm leading-6 text-muted-foreground"> We sent a verification link to </p> 
                <p className="mt-1 font-medium"> {maskedEmail} </p> </div> {/* Message */} 
                <div className="mt-6 rounded-xl border bg-muted/40 p-4 text-center"> 
                <p className="text-sm leading-6 text-muted-foreground"> Please check your inbox and click the verification link to activate your account. </p> 
                </div> {/* Success message */} {sent && ( <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600"> <CheckCircle2 className="h-4 w-4 shrink-0" /> Verification email sent successfully. </div> )} {/* Resend */} <button type="button" onClick={handleResend} disabled={isSending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60" > <RefreshCw className={`h-4 w-4 ${ isSending ? "animate-spin" : "" }`} /> {isSending ? "Sending..." : "Resend verification email"} </button> {/* Change email */} {onChangeEmail && ( <button type="button" onClick={onChangeEmail} className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground" > Change email address </button> )} {/* Help */} <p className="mt-6 text-center text-xs leading-5 text-muted-foreground"> Didn&apos;t receive the email? Check your spam or junk folder. </p> </div> </div>
    );
};

export default EmailVerificationBanner;