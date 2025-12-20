"use client";

import { useSignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Eye, EyeOff, Lock, User } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const { user } = useUser();

  useEffect(() => {
    const role = user?.publicMetadata.role;

    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // NEW STATES
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setLoading(true);
      const result = await signIn.create({
        identifier,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        const role = user?.publicMetadata?.role;
        // const role = result?.user?.publicMetadata?.role;
        if (role) {
          router.push(`/${role}`);
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center signInBackground">
      <div className="container">
        <div className="bubbles">
          {[
            11, 12, 24, 10, 14, 23, 18, 16, 19, 20, 22, 25, 18, 21, 15, 13, 26,
            17, 13, 28, 11, 12, 24, 10, 14, 23, 18, 16, 19, 20, 22, 25, 18, 21,
            15, 13, 26, 17, 13, 28,
          ].map((i, index) => (
            <span
              key={index}
              style={{ "--i": i } as React.CSSProperties}
            ></span>
          ))}
        </div>
      </div>
      <div className="login-glass absolute">
        <form
          onSubmit={handleSubmit}
          className="login-form bg-white/90 py-12 px-8 rounded-xl shadow-2xl flex flex-col gap-4"
        >
          <h3 className="text-sm font-semibold self-start">Welcome to</h3>
          <h1 className="sm:text-lg md:text-xl font-bold flex self-start gap-2 mb-4 border-b p-2">
            <Image
              src="/logo.jpg"
              alt="logo"
              width={28}
              height={28}
              className="logo-animate"
            />
            AL-AZEEZ INTERNATIONAL SCHOOL
          </h1>

          <h2 className="text-gray-400">Sign in to your account</h2>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-2">
            <div className="floating-field">
              <User className="floating-icon" size={18} />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder=" "
                className="floating-input"
              />
              <label className="floating-label">Username</label>
            </div>
          </div>

          {/* PASSWORD FIELD WITH SHOW/HIDE */}
          <div className="flex flex-col gap-2">
            <div className="floating-field">
              <Lock className="floating-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                className="floating-input pr-10"
              />
              <label className="floating-label">Password</label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="floating-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* SUBMIT WITH LOADING SPINNER */}
          {/* <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white my-1 rounded-md text-sm p-2.5 flex justify-center"
          > */}
          <button type="submit" disabled={loading} className="login-button">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;



// import { useSignIn } from "@clerk/nextjs"; 
// import { useEffect, useState } from "react"; 
// import Image from "next/image"; 
// import { useRouter } from "next/navigation"; 
// import { useUser } from "@clerk/nextjs"; 
// import { Eye, EyeOff, Lock, User } from "lucide-react"; 
// const LoginPage = () => { 
// const router = useRouter(); 
// const { isLoaded, signIn, setActive } = useSignIn(); 
// const { user } = useUser(); 
// useEffect(() => { 
// const role = user?.publicMetadata.role; 
// if (role) { router.push(/${role}); } }, 
// [user, router]); 
// const [identifier, setIdentifier] = useState(""); 
// const [password, setPassword] = useState(""); 
// const [error, setError] = useState(""); // NEW STATES 
// const [showPassword, setShowPassword] = useState(false); 
// const [loading, setLoading] = useState(false); 
// const handleSubmit = async (e: React.FormEvent) => { 
// e.preventDefault(); if (!isLoaded) return; 
// try { setLoading(true); 
// const result = await signIn.create({ identifier, password, }); 
// if (result.status === "complete") { await setActive({ session: result.createdSessionId }); 
// const role = user?.publicMetadata?.role; // 
// const role = result?.user?.publicMetadata?.role; 
// if (role) { router.push(/${role}); } } } 
// catch (err: any) { setError(err.errors?.[0]?.message || "Invalid credentials"); } 
// finally { setLoading(false); } }; 
// return ( 
// <div className="h-screen flex items-center justify-center signInBackground"> 
// <div className="container"> 
// <div className="bubbles"> 
// <span style="--i:11;"></span> 
// <span style="--i:12;"></span> 
// <span style="--i:24;"></span> 
// <span style="--i:10;"></span> 
// <span style="--i:14;"></span> 
// <span style="--i:23;"></span> 
// <span style="--i:18;"></span> 
// <span style="--i:16;"></span> 
// <span style="--i:19;"></span> 
// <span style="--i:20;"></span> 
// <span style="--i:22;"></span> 
// <span style="--i:25;"></span> 
// <span style="--i:18;"></span> 
// <span style="--i:21;"></span> 
// <span style="--i:15;"></span> 
// <span style="--i:13;"></span> 
// <span style="--i:26;"></span> 
// <span style="--i:17;"></span> 
// <span style="--i:13;"></span> 
// <span style="--i:28;"></span> 
// </div> 
// </div> 
// <div className="p-4 bg-[#c9ecf888]"> 
// <form onSubmit={handleSubmit} className="bg-white py-12 px-8 rounded-md shadow-2xl flex flex-col gap-4" >
//  <h3 className="text-sm font-semibold self-start">Welcome to</h3> 
// <h1 className="sm:text-lg md:text-xl font-bold flex self-start gap-2 mb-4 border-b p-2"> 
// <Image src="/logo.jpg" alt="logo" width={24} height={24} />
//  AL-AZEEZ INTERNATIONAL SCHOOL 
// </h1> 
// <h2 className="text-gray-400">Sign in to your account</h2> 
// {error && <p className="text-sm text-red-500">{error}</p>} 
// <div className="flex flex-col gap-2"> 
// <label className="text-xs text-gray-500">Username</label> 
// <div className="relative"> 
// <div className="absolute left-2 top-2.5 text-xs text-gray-500 border-r border-gray-300 pr-1"> 
// <User size={18} color="gray" /> </div> <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="p-2 rounded-md ring-1 ring-gray-300 w-full pl-10" /> 
// </div> 
// </div> 
// {/* PASSWORD FIELD WITH SHOW/HIDE */}
//  <div className="flex flex-col gap-2"> 
// <label className="text-xs text-gray-500">Password</label> 
// <div className="relative"> <div className="absolute left-2 top-2.5 text-xs text-gray-500 border-r border-gray-300 pr-1"> 
// <Lock size={18} color="gray" /> 
// </div> 
// <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="p-2 rounded-md ring-1 ring-gray-300 w-full pl-10" /> 
// {/* SHOW/HIDE TOGGLE */}
//  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2.5 text-xs text-gray-500" > {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//  </button>
//  </div> 
// </div> 
// {/* SUBMIT WITH LOADING SPINNER */}
//  <button type="submit" disabled={loading} className="bg-blue-500 text-white my-1 rounded-md text-sm p-2.5 flex justify-center" > {loading ? ( <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin">
// </div> ) : ( "Sign In" )} 
// </button> 
// </form> 
// </div> 
// </div> 
// ); 
// };
//  export default LoginPage;