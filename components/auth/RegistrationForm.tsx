"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "../ui/button";

interface InputForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export default function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputForm>();

  const onSubmit: SubmitHandler<InputForm> = (data) => {
    console.log("Form Submitted:", data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-950">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Trust Pass
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create your account to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-gray-700 dark:text-white"
                {...register("firstName", {
                  required: "First name is required",
                })}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-gray-700 dark:text-white"
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-gray-700 dark:text-white"
              {...register("phoneNumber", {
                required: "Phone number is required",
              })}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-gray-700 dark:text-white"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-gray-700 dark:text-white"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="mt-2 w-full py-2.5">
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
}
