"use client"

import { LoginForm } from "@/components/login-form";
import Footer from "../footer/page";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 items-center justify-center rounded-md text-primary-foreground">
              <img
                src="/images/logo.png"
                alt="Bizz Suite"
                className="h-8 w-auto"
              />
            </div>

            Bizz Suite
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/images/loginPage.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <Footer />
    </div>
  );
}
