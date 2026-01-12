"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else {
        alert("Success! Check your email to confirm, then log in.");
        setIsSignUp(false);
      }
    } else {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role, onboarding_completed')
          .eq('id', user.id)
          .single();
          
        if (profile?.role === 'driver') {
            router.push("/driver/dashboard");
        } 
        else if (profile?.role === 'merchant') {
            router.push("/merchant/dashboard");
        } 
        else if (profile?.role === 'admin') {
            router.push("/admin");
        } 
        else {
            if (profile?.onboarding_completed) {
                router.push("/");
            } else {
                router.push("/onboarding");
            }
        }
      }
    }
    setLoading(false);
  };

const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      alert("Google Login Error: " + error.message)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#FDF8F0]">
      
      {/* LEFT SIDE - Warm Orange/Cream Theme */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 text-white overflow-hidden">
        
        {/* Geometric Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Warm Glow Effects */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
        
        {/* Abstract Food-themed Shapes */}
        <div className="absolute top-1/4 right-1/4 w-0 h-0 border-l-[100px] border-l-transparent border-r-[100px] border-r-transparent border-b-[150px] border-b-white/10 rotate-45"></div>
        <div className="absolute bottom-1/4 left-1/3 w-0 h-0 border-l-[80px] border-l-transparent border-r-[80px] border-r-transparent border-b-[120px] border-b-white/10 -rotate-12"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <img src="/sedapify-logo-2.png" alt="Logo" className="w-12 h-12 rounded-lg p-2" />
            </div>
            <span className="text-2xl italic font-bold">Sedapify</span>
          </Link>

          {/* Hero Text */}
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Cook Smarter.<br />
              Create Faster.<br />
              Eat Anywhere.
            </h1>
            <p className="text-lg text-orange-50 leading-relaxed">
              From quick meal prep to full-length recipes, our powerful AI lets you create culinary magic seamlessly across all devices.
            </p>
          </div>

          {/* Pagination Dots */}
          <div className="flex gap-2">
            <div className="w-8 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Cream/White Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#FDF8F0] relative">
        
        {/* Back to Website Link */}
        <Link 
          href="/" 
          className="absolute top-8 right-8 text-sm text-gray-600 hover:text-gray-900 transition font-medium"
        >
          ← Back to Website
        </Link>

        {/* Form Container */}
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/fyp-logo.png" alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">Sedapify</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? "Create Account" : "Welcome Back!"}
          </h2>
          <p className="text-gray-600 mb-8">
            {isSignUp 
              ? "Log in to start creating stunning recipes with ease." 
              : "Log in to start creating stunning recipes with ease."}
          </p>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="Input your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={isSignUp ? "Create a strong password" : "Input your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">Remember Me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-orange-600 font-medium hover:text-orange-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-orange-500 text-white font-semibold py-3.5 rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                isSignUp ? "Sign Up" : "Login"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-sm text-gray-500">Or continue with</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full border-2 cursor-pointer border-gray-200 bg-white text-gray-700 font-medium py-3.5 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition flex items-center justify-center gap-3"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-orange-600 font-semibold hover:text-orange-700 hover:underline"
            >
              {isSignUp ? "Log in here" : "Sign up here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}