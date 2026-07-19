import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function VerifyEmailScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold mb-1 block">
            BoloDB
          </Link>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a verification link. Please check your inbox and
            click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Once verified, you can sign in to your account.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Go to sign in
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
