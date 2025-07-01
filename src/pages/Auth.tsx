import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, signIn, verifyOTP } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(email);
    
    if (result.error) {
      setError(result.error);
    } else {
      setStep('otp');
    }
    
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);
    setError('');

    const result = await verifyOTP(email, otp);
    
    if (result.error) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold">SVG Spark Vault</h1>
          <p className="text-muted-foreground">
            {step === 'email' ? 'Sign in to your account' : 'Enter verification code'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'email' ? 'Welcome back' : 'Verify your email'}
            </CardTitle>
            <CardDescription>
              {step === 'email' 
                ? 'Enter your email to receive a verification code'
                : `We've sent a 6-digit code to ${email}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !email}
                >
                  {loading ? 'Sending...' : 'Send verification code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      maxLength={6}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify code'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full" 
                    onClick={handleBackToEmail}
                    disabled={loading}
                  >
                    Back to email
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our terms of service and privacy policy.
        </div>
      </div>
    </div>
  );
}