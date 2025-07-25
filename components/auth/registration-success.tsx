import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full py-6 flex justify-center items-center border-b border-gray-200 bg-white">
        <Link href="/" className="flex items-center">
          <div className="bg-emerald-500 text-white p-2 rounded-md mr-2">
            <span className="font-bold">SurveyDU</span>
          </div>
        </Link>
      </header>

      {/* Success Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-600">Registration Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl mb-4">✉️</div>
            <p className="text-gray-600">
              Thank you for registering! We've sent a confirmation email to your address.
              Please check your email and click the verification link to activate your account.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth/signin" className="w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                Proceed to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 