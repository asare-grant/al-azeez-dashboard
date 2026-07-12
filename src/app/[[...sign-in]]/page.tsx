// "use client";

// import { useSignIn } from "@clerk/nextjs";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import { Eye, EyeOff, Lock, User } from "lucide-react";

// const LoginPage = () => {
//   const router = useRouter();
//   const { isLoaded, signIn, setActive } = useSignIn();

//   const { user } = useUser();

//   useEffect(() => {
//     const role = user?.publicMetadata.role;

//     if (role) {
//       router.push(`/${role}`);
//     }
//   }, [user, router]);

//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   // NEW STATES
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isLoaded) return;

//     try {
//       setLoading(true);
//       const result = await signIn.create({
//         identifier,
//         password,
//       });

//       if (result.status === "complete") {
//         await setActive({ session: result.createdSessionId });

//         const role = user?.publicMetadata?.role;
//         // const role = result?.user?.publicMetadata?.role;
//         if (role) {
//           router.push(`/${role}`);
//         }
//       }
//     } catch (err: any) {
//       setError(err.errors?.[0]?.message || "Invalid credentials");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="h-screen flex items-center justify-center signInBackground">
//       <div className="container">
//         <div className="bubbles">
//           {[
//             11, 12, 24, 10, 14, 23, 18, 16, 19, 20, 22, 25, 18, 21, 15, 13, 26,
//             17, 13, 28, 11, 12, 24, 10, 14, 23, 18, 16, 19, 20, 22, 25, 18, 21,
//             15, 13, 26, 17, 13, 28,
//           ].map((i, index) => (
//             <span
//               key={index}
//               style={{ "--i": i } as React.CSSProperties}
//             ></span>
//           ))}
//         </div>
//       </div>
//       <div className="login-glass absolute">
//         <form
//           onSubmit={handleSubmit}
//           className="login-form bg-white/90 py-12 px-8 rounded-xl shadow-2xl flex flex-col gap-4"
//         >
//           <h3 className="text-sm font-semibold self-start">Welcome to</h3>
//           <h1 className="sm:text-lg md:text-xl font-bold flex self-start gap-2 mb-4 border-b p-2">
//             <Image
//               src="/logo.jpg"
//               alt="logo"
//               width={28}
//               height={28}
//               className="logo-animate"
//             />
//             AL-AZEEZ INTERNATIONAL SCHOOL
//           </h1>

//           <h2 className="text-gray-400">Sign in to your account</h2>

//           {error && <p className="text-sm text-red-500">{error}</p>}

//           <div className="flex flex-col gap-2">
//             <div className="floating-field">
//               <User className="floating-icon" size={18} />
//               <input
//                 type="text"
//                 value={identifier}
//                 onChange={(e) => setIdentifier(e.target.value)}
//                 required
//                 placeholder=" "
//                 className="floating-input"
//               />
//               <label className="floating-label">Username</label>
//             </div>
//           </div>

//           {/* PASSWORD FIELD WITH SHOW/HIDE */}
//           <div className="flex flex-col gap-2">
//             <div className="floating-field">
//               <Lock className="floating-icon" size={18} />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder=" "
//                 className="floating-input pr-10"
//               />
//               <label className="floating-label">Password</label>

//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="floating-toggle"
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           {/* SUBMIT WITH LOADING SPINNER */}
//           {/* <button
//             type="submit"
//             disabled={loading}
//             className="bg-blue-500 text-white my-1 rounded-md text-sm p-2.5 flex justify-center"
//           > */}
//           <button type="submit" disabled={loading} className="login-button flex items-center justify-center">
//             {loading ? (
//               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//             ) : (
//               "Sign In"
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

// "use client";

// import { useSignIn, useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import {
//   ArrowRight,
//   BarChart3,
//   BookOpenCheck,
//   Eye,
//   EyeOff,
//   GraduationCap,
//   Lock,
//   ShieldCheck,
//   User,
//   Users,
// } from "lucide-react";

// const LoginPage = () => {
//   const router = useRouter();
//   const { isLoaded, signIn, setActive } = useSignIn();
//   const { user } = useUser();

//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [remember, setRemember] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const role = user?.publicMetadata.role;
//     if (role) router.push(`/${role}`);
//   }, [user, router]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isLoaded) return;

//     try {
//       setLoading(true);
//       setError("");

//       const result = await signIn.create({
//         identifier,
//         password,
//       });

//       if (result.status === "complete") {
//         await setActive({ session: result.createdSessionId });
//         router.push("/admin");
//       }
//     } catch (err: any) {
//       setError(err.errors?.[0]?.message || "Invalid credentials");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#eef4ff,transparent_35%),linear-gradient(135deg,#f8fbff,#dfe9ff)] text-[#081a3d]">
//       {/* MOBILE ONLY */}
//       <section className="flex min-h-screen flex-col bg-white lg:hidden">
//         <div className="rounded-b-[3rem] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 px-6 pb-10 pt-12 text-white shadow-xl">
//           <div className="flex items-center gap-4">
//             <Image
//               src="/logo.jpg"
//               alt="logo"
//               width={60}
//               height={60}
//               className="rounded-xl bg-white p-1"
//             />

//             <div>
//               <h1 className="text-xl font-black">Welcome Back 👋</h1>
//               <p className="mt-1 text-sm text-blue-50">
//                 Al-Azeez International School
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-1 flex-col px-6 py-10">
//           <h2 className="text-center text-3xl font-black">Sign In</h2>
//           <p className="mt-2 text-center text-sm text-slate-500">
//             Sign in to access your dashboard
//           </p>

//           <LoginForm
//             identifier={identifier}
//             setIdentifier={setIdentifier}
//             password={password}
//             setPassword={setPassword}
//             showPassword={showPassword}
//             setShowPassword={setShowPassword}
//             remember={remember}
//             setRemember={setRemember}
//             loading={loading}
//             error={error}
//             handleSubmit={handleSubmit}
//           />
//         </div>
//       </section>

//       {/* DESKTOP ONLY */}
//       <section className="hidden min-h-screen items-center justify-center px-8 py-8 lg:flex">
//         <div className="w-full max-w-6xl rounded-[2.5rem] bg-white/45 p-8 shadow-[0_35px_120px_rgba(41,98,210,0.18)] backdrop-blur-xl">
//           <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-2">
//             <div className="px-12 py-14">
//               <div className="mb-12 flex items-center gap-4">
//                 <Image
//                   src="/logo.jpg"
//                   alt="logo"
//                   width={70}
//                   height={70}
//                   className="rounded-xl"
//                 />

//                 <div>
//                   <h1 className="text-3xl font-black tracking-wide">
//                     AL-AZEEZ
//                   </h1>
//                   <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
//                     International School
//                   </p>
//                   <p className="text-xs font-semibold text-amber-500">
//                     Knowledge. Faith. Perseverance.
//                   </p>
//                 </div>
//               </div>

//               <h2 className="text-4xl font-black">Welcome Back! 👋</h2>
//               <p className="mt-3 text-slate-500">
//                 Sign in to access your student management dashboard
//               </p>

//               <LoginForm
//                 identifier={identifier}
//                 setIdentifier={setIdentifier}
//                 password={password}
//                 setPassword={setPassword}
//                 showPassword={showPassword}
//                 setShowPassword={setShowPassword}
//                 remember={remember}
//                 setRemember={setRemember}
//                 loading={loading}
//                 error={error}
//                 handleSubmit={handleSubmit}
//               />
//             </div>

//             <div className="relative flex min-h-[620px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 px-10 text-white">
//               <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full border border-white/20" />
//               <div className="absolute -left-10 -top-10 h-60 w-60 rounded-full border border-white/10" />

//               <div className="absolute right-10 top-10 grid grid-cols-5 gap-2 opacity-40">
//                 {Array.from({ length: 25 }).map((_, i) => (
//                   <span key={i} className="h-1 w-1 rounded-full bg-white" />
//                 ))}
//               </div>

//               <div className="mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl">
//                 <GraduationCap size={46} className="text-blue-600" />
//               </div>

//               <h3 className="max-w-sm text-center text-4xl font-black leading-tight">
//                 Manage Students. Track Progress. Build Excellence.
//               </h3>

//               <p className="mt-6 max-w-sm text-center leading-7 text-blue-50">
//                 A secure school management system for academics, attendance,
//                 finance and communication.
//               </p>

//               <div className="mt-10 flex gap-3">
//                 <span className="h-1.5 w-16 rounded-full bg-white" />
//                 <span className="h-1.5 w-16 rounded-full bg-white/20" />
//                 <span className="h-1.5 w-16 rounded-full bg-white/20" />
//               </div>
//             </div>
//           </div>

//           <div className="mt-8 grid grid-cols-4 gap-6 rounded-[2rem] bg-white/80 p-8 shadow-lg">
//             {[
//               {
//                 icon: ShieldCheck,
//                 title: "Secure Access",
//                 text: "Protected login for all authorized users.",
//                 color: "bg-blue-100 text-blue-600",
//               },
//               {
//                 icon: Users,
//                 title: "User Management",
//                 text: "Manage students, teachers and parents.",
//                 color: "bg-violet-100 text-violet-600",
//               },
//               {
//                 icon: BarChart3,
//                 title: "Track Progress",
//                 text: "Monitor performance and records.",
//                 color: "bg-emerald-100 text-emerald-600",
//               },
//               {
//                 icon: BookOpenCheck,
//                 title: "Academic Control",
//                 text: "Manage classes, lessons and results.",
//                 color: "bg-amber-100 text-amber-600",
//               },
//             ].map((item) => {
//               const Icon = item.icon;

//               return (
//                 <div key={item.title}>
//                   <div
//                     className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${item.color}`}
//                   >
//                     <Icon size={24} />
//                   </div>
//                   <h4 className="font-bold">{item.title}</h4>
//                   <p className="mt-2 text-sm leading-6 text-slate-500">
//                     {item.text}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };

// function LoginForm({
//   identifier,
//   setIdentifier,
//   password,
//   setPassword,
//   showPassword,
//   setShowPassword,
//   remember,
//   setRemember,
//   loading,
//   error,
//   handleSubmit,
// }: any) {
//   return (
//     <form onSubmit={handleSubmit} className="mt-8 space-y-5">
//       {error && (
//         <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
//           {error}
//         </p>
//       )}

//       <div className="relative">
//         <User
//           size={19}
//           className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//         />
//         <input
//           type="text"
//           value={identifier}
//           onChange={(e) => setIdentifier(e.target.value)}
//           required
//           placeholder="Username"
//           className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//         />
//       </div>

//       <div className="relative">
//         <Lock
//           size={19}
//           className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//         />
//         <input
//           type={showPassword ? "text" : "password"}
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           placeholder="Password"
//           className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//         />

//         <button
//           type="button"
//           onClick={() => setShowPassword(!showPassword)}
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
//         >
//           {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//         </button>
//       </div>

//       <div className="flex items-center justify-between text-sm">
//         <label className="flex items-center gap-2 text-slate-500">
//           <input
//             type="checkbox"
//             checked={remember}
//             onChange={(e) => setRemember(e.target.checked)}
//             className="h-4 w-4 rounded border-slate-300"
//           />
//           Remember me
//         </label>

//         <button type="button" className="font-semibold text-blue-600">
//           Forgot password?
//         </button>
//       </div>

//       <button
//         type="submit"
//         disabled={loading}
//         className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 font-bold text-white shadow-[0_15px_35px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5 disabled:opacity-70"
//       >
//         {loading ? (
//           <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
//         ) : (
//           <>
//             Sign In <ArrowRight size={18} />
//           </>
//         )}
//       </button>
//     </form>
//   );
// }

// export default LoginPage;








// "use client";

// import { useSignIn, useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import {
//   ArrowRight,
//   BarChart3,
//   BookOpenCheck,
//   Eye,
//   EyeOff,
//   GraduationCap,
//   Lock,
//   School,
//   ShieldCheck,
//   User,
//   Users,
// } from "lucide-react";

// const LoginPage = () => {
//   const router = useRouter();
//   const { isLoaded, signIn, setActive } = useSignIn();
//   const { user } = useUser();

//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [remember, setRemember] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const role = user?.publicMetadata.role;
//     if (role) router.push(`/${role}`);
//   }, [user, router]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isLoaded) return;

//     try {
//       setLoading(true);
//       setError("");

//       const result = await signIn.create({ identifier, password });

//       if (result.status === "complete") {
//         await setActive({ session: result.createdSessionId });
//         router.push("/admin");
//       }
//     } catch (err: any) {
//       setError(err.errors?.[0]?.message || "Invalid credentials");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f8fbff,#dfe9ff)] text-[#081a3d]">
//       {/* MOBILE ONLY */}
//       {/* <section className="relative flex min-h-screen flex-col bg-white lg:hidden">
//         <div className="relative rounded-b-[4rem] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 px-6 pb-12 pt-10 text-white shadow-xl">
//           <div className="absolute right-5 top-5 grid grid-cols-4 gap-1 opacity-30">
//             {Array.from({ length: 16 }).map((_, i) => (
//               <span key={i} className="h-1 w-1 rounded-full bg-white" />
//             ))}
//           </div>

//           <div className="flex items-center gap-4">
//             <Image
//               src="/logo.jpg"
//               alt="logo"
//               width={64}
//               height={64}
//               className="rounded-xl bg-white p-1"
//             />

//             <div>
//               <h1 className="text-xl font-black">Welcome Back! 👋</h1>
//               <p className="mt-1 text-sm text-blue-50">
//                 Al-Azeez International School
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="relative z-10 flex flex-1 flex-col px-6 py-10">
//           <h2 className="text-center text-3xl font-black">Sign In</h2>
//           <p className="mt-2 text-center text-sm text-slate-500">
//             Sign in to access your dashboard
//           </p>

//           <LoginForm
//             identifier={identifier}
//             setIdentifier={setIdentifier}
//             password={password}
//             setPassword={setPassword}
//             showPassword={showPassword}
//             setShowPassword={setShowPassword}
//             remember={remember}
//             setRemember={setRemember}
//             loading={loading}
//             error={error}
//             handleSubmit={handleSubmit}
//           />

//           <div className="pointer-events-none mt-auto flex justify-center pt-10 text-blue-100">
//             <School size={130} strokeWidth={1.2} />
//           </div>
//         </div>
//       </section> */}
//       {/* MOBILE ONLY */}
//       <section className="relative flex min-h-screen flex-col overflow-hidden bg-white lg:hidden">
//         {/* BOTTOM SCHOOL BACKGROUND IMAGE */}
//         <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[20vh] overflow-hidden">
//           <Image
//             src="/dashboard-image.jpeg"
//             alt="school background"
//             fill
//             priority
//             className="object-cover object-bottom opacity-25"
//           />
//           <div className="absolute inset-0 bg-gradient-to-b from-white/100 via-white/65 to-white/50" />
//         </div>

//         {/* BLUE HEADER */}
//         <div className="relative z-10 rounded-b-[4.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-6 pb-14 pt-10 text-white shadow-[0_18px_45px_rgba(37,99,235,0.35)]">
//           <div className="absolute right-6 top-8 grid grid-cols-5 gap-2 opacity-30">
//             {Array.from({ length: 25 }).map((_, i) => (
//               <span key={i} className="h-1 w-1 rounded-full bg-white" />
//             ))}
//           </div>

//           <div className="flex items-center gap-4">
//             <Image
//               src="/logo.jpg"
//               alt="logo"
//               width={72}
//               height={72}
//               className="rounded-2xl bg-white p-1 shadow-lg"
//             />

//             <div>
//               <h1 className="text-2xl font-black leading-tight">
//                 Hello, Welcome! 👋
//               </h1>
//               <p className="mt-1 text-sm font-medium text-blue-50">
//                 Al-Azeez International School
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* CONTENT */}
//         <div className="relative z-10 flex flex-1 flex-col px-6 pb-8 pt-10">
//           <h2 className="text-center text-4xl font-black">Sign In</h2>

//           <p className="mt-2 text-center text-base text-slate-500">
//             Sign in to access your dashboard
//           </p>

//           <LoginForm
//             identifier={identifier}
//             setIdentifier={setIdentifier}
//             password={password}
//             setPassword={setPassword}
//             showPassword={showPassword}
//             setShowPassword={setShowPassword}
//             remember={remember}
//             setRemember={setRemember}
//             loading={loading}
//             error={error}
//             handleSubmit={handleSubmit}
//           />

//           <div className="mt-auto h-[12vh]" />
//         </div>
//       </section>

//       {/* DESKTOP ONLY */}
//       <section className="hidden min-h-screen items-center justify-center px-8 py-8 lg:flex">
//         <div className="w-full max-w-6xl rounded-[2.5rem] bg-white/50 p-8 shadow-[0_35px_120px_rgba(41,98,210,0.18)] backdrop-blur-xl">
//           <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-2">
//             <div className="px-12 py-14">
//               <div className="mb-12 flex items-center gap-4">
//                 <Image
//                   src="/logo.jpg"
//                   alt="logo"
//                   width={70}
//                   height={70}
//                   className="rounded-xl"
//                 />

//                 <div>
//                   <h1 className="text-3xl font-black tracking-wide">
//                     AL-AZEEZ
//                   </h1>
//                   <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
//                     International School
//                   </p>
//                   <p className="text-xs font-semibold text-amber-500">
//                     Knowledge. Faith. Perseverance.
//                   </p>
//                 </div>
//               </div>

//               <h2 className="text-4xl font-black">Welcome Back! 👋</h2>
//               <p className="mt-3 text-slate-500">
//                 Sign in to access your student management dashboard
//               </p>

//               <LoginForm
//                 identifier={identifier}
//                 setIdentifier={setIdentifier}
//                 password={password}
//                 setPassword={setPassword}
//                 showPassword={showPassword}
//                 setShowPassword={setShowPassword}
//                 remember={remember}
//                 setRemember={setRemember}
//                 loading={loading}
//                 error={error}
//                 handleSubmit={handleSubmit}
//               />
//             </div>

//             <div className="relative flex min-h-[620px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 px-10 text-white">
//               <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full border border-white/20" />
//               <div className="absolute -left-10 -top-10 h-60 w-60 rounded-full border border-white/10" />

//               <div className="absolute right-10 top-10 grid grid-cols-5 gap-2 opacity-40">
//                 {Array.from({ length: 25 }).map((_, i) => (
//                   <span key={i} className="h-1 w-1 rounded-full bg-white" />
//                 ))}
//               </div>

//               <div className="relative z-10 mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl">
//                 <GraduationCap size={46} className="text-blue-600" />
//               </div>

//               <h3 className="relative z-10 max-w-sm text-center text-4xl font-black leading-tight">
//                 Manage Students. Track Progress. Build Excellence.
//               </h3>

//               <p className="relative z-10 mt-6 max-w-sm text-center leading-7 text-blue-50">
//                 A secure school management system for academics, attendance,
//                 finance and communication.
//               </p>

//               <div className="relative z-10 mt-10 flex gap-3">
//                 <span className="h-1.5 w-16 rounded-full bg-white" />
//                 <span className="h-1.5 w-16 rounded-full bg-white/20" />
//                 <span className="h-1.5 w-16 rounded-full bg-white/20" />
//               </div>

//               <School
//                 size={260}
//                 strokeWidth={1.1}
//                 className="absolute bottom-[-35px] right-[-5px] text-white/15"
//               />
//             </div>
//           </div>

//           <div className="mt-8 grid grid-cols-4 gap-6 rounded-[2rem] bg-white/80 p-8 shadow-lg">
//             {[
//               {
//                 icon: ShieldCheck,
//                 title: "Secure Access",
//                 text: "Protected login for all authorized users.",
//                 color: "bg-blue-100 text-blue-600",
//               },
//               {
//                 icon: Users,
//                 title: "User Management",
//                 text: "Manage students, teachers and parents.",
//                 color: "bg-violet-100 text-violet-600",
//               },
//               {
//                 icon: BarChart3,
//                 title: "Track Progress",
//                 text: "Monitor performance and records.",
//                 color: "bg-emerald-100 text-emerald-600",
//               },
//               {
//                 icon: BookOpenCheck,
//                 title: "Academic Control",
//                 text: "Manage classes, lessons and results.",
//                 color: "bg-amber-100 text-amber-600",
//               },
//             ].map((item) => {
//               const Icon = item.icon;

//               return (
//                 <div key={item.title}>
//                   <div
//                     className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${item.color}`}
//                   >
//                     <Icon size={24} />
//                   </div>
//                   <h4 className="font-bold">{item.title}</h4>
//                   <p className="mt-2 text-sm leading-6 text-slate-500">
//                     {item.text}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };

// function LoginForm({
//   identifier,
//   setIdentifier,
//   password,
//   setPassword,
//   showPassword,
//   setShowPassword,
//   remember,
//   setRemember,
//   loading,
//   error,
//   handleSubmit,
// }: any) {
//   return (
//     <form onSubmit={handleSubmit} className="mt-8 space-y-5">
//       {error && (
//         <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
//           {error}
//         </p>
//       )}

//       <div className="relative">
//         <User
//           size={19}
//           className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//         />
//         <input
//           type="text"
//           value={identifier}
//           onChange={(e) => setIdentifier(e.target.value)}
//           required
//           placeholder="Username"
//           className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//         />
//       </div>

//       <div className="relative">
//         <Lock
//           size={19}
//           className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//         />
//         <input
//           type={showPassword ? "text" : "password"}
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           placeholder="Password"
//           className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//         />

//         <button
//           type="button"
//           onClick={() => setShowPassword(!showPassword)}
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
//         >
//           {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//         </button>
//       </div>

//       <div className="flex items-center justify-between text-sm">
//         <label className="flex items-center gap-2 text-slate-500">
//           <input
//             type="checkbox"
//             checked={remember}
//             onChange={(e) => setRemember(e.target.checked)}
//             className="h-4 w-4 rounded border-slate-300"
//           />
//           Remember me
//         </label>

//         <button type="button" className="font-semibold text-blue-600">
//           Forgot password?
//         </button>
//       </div>

//       <button
//         type="submit"
//         disabled={loading}
//         className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 font-bold text-white shadow-[0_15px_35px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5 disabled:opacity-70"
//       >
//         {loading ? (
//           <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
//         ) : (
//           <>
//             Sign In <ArrowRight size={18} />
//           </>
//         )}
//       </button>
//     </form>
//   );
// }

// export default LoginPage;







// "use client";

// import { useSignIn, useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import {
//   ArrowRight,
//   BarChart3,
//   BookOpenCheck,
//   Eye,
//   EyeOff,
//   GraduationCap,
//   Lock,
//   School,
//   ShieldCheck,
//   User,
//   Users,
// } from "lucide-react";

// const fadeUp = {
//   hidden: { opacity: 0, y: 24 },
//   show: { opacity: 1, y: 0 },
// };

// const fadeLeft = {
//   hidden: { opacity: 0, x: -28 },
//   show: { opacity: 1, x: 0 },
// };

// const fadeRight = {
//   hidden: { opacity: 0, x: 28 },
//   show: { opacity: 1, x: 0 },
// };

// const stagger = {
//   hidden: {},
//   show: {
//     transition: {
//       staggerChildren: 0.12,
//     },
//   },
// };

// const LoginPage = () => {
//   const router = useRouter();
//   const { isLoaded, signIn, setActive } = useSignIn();
//   const { user } = useUser();

//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [remember, setRemember] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const role = user?.publicMetadata.role;
//     if (role) router.push(`/${role}`);
//   }, [user, router]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isLoaded) return;

//     try {
//       setLoading(true);
//       setError("");

//       const result = await signIn.create({ identifier, password });

//       if (result.status === "complete") {
//         await setActive({ session: result.createdSessionId });
//         router.push("/admin");
//       }
//     } catch (err: any) {
//       setError(err.errors?.[0]?.message || "Invalid credentials");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f8fbff,#dfe9ff)] text-[#081a3d]">
//       {/* MOBILE ONLY */}
//       <section className="relative flex min-h-screen flex-col overflow-hidden bg-white lg:hidden">
//         <motion.div
//           initial={{ opacity: 0, scale: 1.05 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1 }}
//           className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[20vh] overflow-hidden"
//         >
//           <Image
//             src="/dashboard-image.jpeg"
//             alt="school background"
//             fill
//             priority
//             className="object-cover object-bottom opacity-25"
//           />
//           <div className="absolute inset-0 bg-gradient-to-b from-white/100 via-white/65 to-white/50" />
//         </motion.div>

//         <motion.div
//           initial="hidden"
//           animate="show"
//           variants={fadeUp}
//           transition={{ duration: 0.7 }}
//           className="relative z-10 rounded-b-[4.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-6 pb-14 pt-10 text-white shadow-[0_18px_45px_rgba(37,99,235,0.35)]"
//         >
//           <motion.div
//             animate={{ y: [0, -8, 0] }}
//             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
//             className="absolute right-6 top-8 grid grid-cols-5 gap-2 opacity-30"
//           >
//             {Array.from({ length: 25 }).map((_, i) => (
//               <span key={i} className="h-1 w-1 rounded-full bg-white" />
//             ))}
//           </motion.div>

//           <div className="flex items-center gap-4">
//             <motion.div
//               initial={{ scale: 0.85, opacity: 0 }}
//               animate={{
//                 scale: [1, 1.05, 1],
//                 opacity: 1,
//               }}
//               transition={{
//                 opacity: { duration: 0.4 },
//                 scale: {
//                   duration: 5,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 },
//               }}
//             >
//               <Image
//                 src="/logo.jpg"
//                 alt="logo"
//                 width={72}
//                 height={72}
//                 className="rounded-2xl bg-white p-1 shadow-lg"
//               />
//             </motion.div>

//             <motion.div variants={fadeLeft}>
//               <h1 className="text-2xl font-black leading-tight">
//                 Hello, Welcome! 👋
//               </h1>
//               <p className="mt-1 text-sm font-medium text-blue-50">
//                 Al-Azeez International School
//               </p>
//             </motion.div>
//           </div>
//         </motion.div>

//         <motion.div
//           variants={stagger}
//           initial="hidden"
//           animate="show"
//           className="relative z-10 flex flex-1 flex-col px-6 pb-8 pt-10"
//         >
//           <motion.h2 variants={fadeUp} className="text-center text-4xl font-black">
//             Sign In
//           </motion.h2>

//           <motion.p
//             variants={fadeUp}
//             className="mt-2 text-center text-base text-slate-500"
//           >
//             Sign in to access your dashboard
//           </motion.p>

//           <motion.div variants={fadeUp}>
//             <LoginForm
//               identifier={identifier}
//               setIdentifier={setIdentifier}
//               password={password}
//               setPassword={setPassword}
//               showPassword={showPassword}
//               setShowPassword={setShowPassword}
//               remember={remember}
//               setRemember={setRemember}
//               loading={loading}
//               error={error}
//               handleSubmit={handleSubmit}
//             />
//           </motion.div>

//           <div className="mt-auto h-[12vh]" />
//         </motion.div>
//       </section>

//       {/* DESKTOP ONLY */}
//       <section className="hidden min-h-screen items-center justify-center px-8 py-8 lg:flex">
//         <motion.div
//           initial={{ opacity: 0, y: 28, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           className="w-full max-w-6xl rounded-[2.5rem] bg-white/50 p-8 shadow-[0_35px_120px_rgba(41,98,210,0.18)] backdrop-blur-xl"
//         >
//           <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-2">
//             <motion.div
//               variants={stagger}
//               initial="hidden"
//               animate="show"
//               className="px-12 py-14"
//             >
//               <motion.div variants={fadeLeft} className="mb-12 flex items-center gap-4">
//                 <motion.div
//                   animate={{ scale: [1, 1.04, 1] }}
//                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
//                 >
//                   <Image
//                     src="/logo.jpg"
//                     alt="logo"
//                     width={70}
//                     height={70}
//                     className="rounded-xl"
//                   />
//                 </motion.div>

//                 <div>
//                   <h1 className="text-3xl font-black tracking-wide">AL-AZEEZ</h1>
//                   <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
//                     International School
//                   </p>
//                   <p className="text-xs font-semibold text-amber-500">
//                     Knowledge. Faith. Perseverance.
//                   </p>
//                 </div>
//               </motion.div>

//               <motion.h2 variants={fadeUp} className="text-4xl font-black">
//                 Welcome Back! 👋
//               </motion.h2>

//               <motion.p variants={fadeUp} className="mt-3 text-slate-500">
//                 Sign in to access your student management dashboard
//               </motion.p>

//               <motion.div variants={fadeUp}>
//                 <LoginForm
//                   identifier={identifier}
//                   setIdentifier={setIdentifier}
//                   password={password}
//                   setPassword={setPassword}
//                   showPassword={showPassword}
//                   setShowPassword={setShowPassword}
//                   remember={remember}
//                   setRemember={setRemember}
//                   loading={loading}
//                   error={error}
//                   handleSubmit={handleSubmit}
//                 />
//               </motion.div>
//             </motion.div>

//             <motion.div
//               initial="hidden"
//               animate="show"
//               variants={fadeRight}
//               transition={{ duration: 0.8 }}
//               className="relative flex min-h-[620px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 px-10 text-white"
//             >
//               <motion.div
//                 animate={{ scale: [1, 1.08, 1], rotate: [0, 4, 0] }}
//                 transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
//                 className="absolute -left-24 -top-24 h-80 w-80 rounded-full border border-white/20"
//               />
//               <motion.div
//                 animate={{ scale: [1, 1.12, 1] }}
//                 transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
//                 className="absolute -left-10 -top-10 h-60 w-60 rounded-full border border-white/10"
//               />

//               <motion.div
//                 animate={{ y: [0, -10, 0] }}
//                 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
//                 className="absolute right-10 top-10 grid grid-cols-5 gap-2 opacity-40"
//               >
//                 {Array.from({ length: 25 }).map((_, i) => (
//                   <span key={i} className="h-1 w-1 rounded-full bg-white" />
//                 ))}
//               </motion.div>

//               <motion.div
//                 animate={{ y: [0, -8, 0], scale: [1, 1.04, 1] }}
//                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
//                 className="relative z-10 mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl"
//               >
//                 <GraduationCap size={46} className="text-blue-600" />
//               </motion.div>

//               <motion.h3
//                 variants={fadeUp}
//                 className="relative z-10 max-w-sm text-center text-4xl font-black leading-tight"
//               >
//                 Manage Students. Track Progress. Build Excellence.
//               </motion.h3>

//               <motion.p
//                 variants={fadeUp}
//                 className="relative z-10 mt-6 max-w-sm text-center leading-7 text-blue-50"
//               >
//                 A secure school management system for academics, attendance,
//                 finance and communication.
//               </motion.p>

//               <motion.div variants={fadeUp} className="relative z-10 mt-10 flex gap-3">
//                 <span className="h-1.5 w-16 rounded-full bg-white" />
//                 <span className="h-1.5 w-16 rounded-full bg-white/20" />
//                 <span className="h-1.5 w-16 rounded-full bg-white/20" />
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 60 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 1, delay: 0.4 }}
//                 className="absolute bottom-[-35px] right-[-5px] text-white/15"
//               >
//                 <School size={260} strokeWidth={1.1} />
//               </motion.div>
//             </motion.div>
//           </div>

//           <motion.div
//             variants={stagger}
//             initial="hidden"
//             animate="show"
//             className="mt-8 grid grid-cols-4 gap-6 rounded-[2rem] bg-white/80 p-8 shadow-lg"
//           >
//             {[
//               {
//                 icon: ShieldCheck,
//                 title: "Secure Access",
//                 text: "Protected login for all authorized users.",
//                 color: "bg-blue-100 text-blue-600",
//               },
//               {
//                 icon: Users,
//                 title: "User Management",
//                 text: "Manage students, teachers and parents.",
//                 color: "bg-violet-100 text-violet-600",
//               },
//               {
//                 icon: BarChart3,
//                 title: "Track Progress",
//                 text: "Monitor performance and records.",
//                 color: "bg-emerald-100 text-emerald-600",
//               },
//               {
//                 icon: BookOpenCheck,
//                 title: "Academic Control",
//                 text: "Manage classes, lessons and results.",
//                 color: "bg-amber-100 text-amber-600",
//               },
//             ].map((item) => {
//               const Icon = item.icon;

//               return (
//                 <motion.div key={item.title} variants={fadeUp}>
//                   <motion.div
//                     whileHover={{ y: -3, scale: 1.05 }}
//                     className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${item.color}`}
//                   >
//                     <Icon size={24} />
//                   </motion.div>
//                   <h4 className="font-bold">{item.title}</h4>
//                   <p className="mt-2 text-sm leading-6 text-slate-500">
//                     {item.text}
//                   </p>
//                 </motion.div>
//               );
//             })}
//           </motion.div>
//         </motion.div>
//       </section>
//     </main>
//   );
// };

// function LoginForm({
//   identifier,
//   setIdentifier,
//   password,
//   setPassword,
//   showPassword,
//   setShowPassword,
//   remember,
//   setRemember,
//   loading,
//   error,
//   handleSubmit,
// }: any) {
//   return (
//     <form onSubmit={handleSubmit} className="mt-8 space-y-5">
//       {error && (
//         <motion.p
//           initial={{ opacity: 0, y: -8 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
//         >
//           {error}
//         </motion.p>
//       )}

//       <motion.div whileFocus={{ scale: 1.01 }} className="relative">
//         <User
//           size={19}
//           className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//         />
//         <input
//           type="text"
//           value={identifier}
//           onChange={(e) => setIdentifier(e.target.value)}
//           required
//           placeholder="Username"
//           className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium outline-none transition-all duration-300 focus:-translate-y-0.5 focus:border-blue-500 focus:shadow-[0_15px_35px_rgba(37,99,235,0.12)] focus:ring-4 focus:ring-blue-100"
//         />
//       </motion.div>

//       <motion.div className="relative">
//         <Lock
//           size={19}
//           className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//         />
//         <input
//           type={showPassword ? "text" : "password"}
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           placeholder="Password"
//           className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm font-medium outline-none transition-all duration-300 focus:-translate-y-0.5 focus:border-blue-500 focus:shadow-[0_15px_35px_rgba(37,99,235,0.12)] focus:ring-4 focus:ring-blue-100"
//         />

//         <button
//           type="button"
//           onClick={() => setShowPassword(!showPassword)}
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
//         >
//           {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//         </button>
//       </motion.div>

//       <motion.div className="flex items-center justify-between text-sm">
//         <label className="flex items-center gap-2 text-slate-500">
//           <input
//             type="checkbox"
//             checked={remember}
//             onChange={(e) => setRemember(e.target.checked)}
//             className="h-4 w-4 rounded border-slate-300"
//           />
//           Remember me
//         </label>

//         <button type="button" className="font-semibold text-blue-600">
//           Forgot password?
//         </button>
//       </motion.div>

//       <motion.button
//         whileHover={{ y: -2, scale: 1.01 }}
//         whileTap={{ scale: 0.98 }}
//         type="submit"
//         disabled={loading}
//         className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 font-bold text-white shadow-[0_15px_35px_rgba(37,99,235,0.35)] transition disabled:opacity-70"
//       >
//         {loading ? (
//           <span className="flex items-center gap-1">
//             Signing you in
//             <span className="animate-bounce">.</span>
//             <span className="animate-bounce delay-150">.</span>
//             <span className="animate-bounce delay-300">.</span>
//           </span>
//         ) : (
//           <>
//             Sign In
//             <ArrowRight
//               size={18}
//               className="transition-transform duration-300 group-hover:translate-x-1"
//             />
//           </>
//         )}
//       </motion.button>
//     </form>
//   );
// }

// export default LoginPage;








"use client";

import { useSignIn, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  School,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

const premiumEase = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 34, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: premiumEase },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -36, filter: "blur(8px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: premiumEase },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 36, filter: "blur(8px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: premiumEase },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94, filter: "blur(10px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1, ease: premiumEase },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.15,
    },
  },
};

const LoginPage = () => {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user } = useUser();
  const shouldReduceMotion = useReducedMotion();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = user?.publicMetadata.role;
    if (role) router.push(`/${role}`);
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError("");

      const result = await signIn.create({ identifier, password });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionConfig reducedMotion={shouldReduceMotion ? "always" : "never"}>
      <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f8fbff,#dfe9ff)] text-[#081a3d]">
        {/* MOBILE ONLY */}
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-white lg:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: premiumEase }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[20vh] overflow-hidden"
          >
            <Image
              src="/dashboard-image.jpeg"
              alt="school background"
              fill
              priority
              className="object-cover object-bottom opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-white/50" />
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="relative z-10 rounded-b-[4.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-6 pb-14 pt-10 text-white shadow-[0_18px_45px_rgba(37,99,235,0.35)]"
          >
            <motion.div
              animate={{ y: [0, -8, 0], opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-6 top-8 grid grid-cols-5 gap-2"
            >
              {Array.from({ length: 25 }).map((_, i) => (
                <span key={i} className="h-1 w-1 rounded-full bg-white" />
              ))}
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.82, opacity: 0 }}
                animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                transition={{
                  opacity: { duration: 0.5, ease: premiumEase },
                  scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <Image
                  src="/logo.jpg"
                  alt="logo"
                  width={72}
                  height={72}
                  className="rounded-2xl bg-white p-1 shadow-lg"
                />
              </motion.div>

              <motion.div variants={fadeLeft}>
                <h1 className="text-2xl font-black leading-tight">
                  Hello, Welcome! 👋
                </h1>
                <p className="mt-1 text-sm font-medium text-blue-50">
                  Al-Azeez International School
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="relative z-10 flex flex-1 flex-col px-6 pb-8 pt-10"
          >
            <motion.h2
              variants={fadeUp}
              className="text-center text-4xl font-black"
            >
              Sign In
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-2 text-center text-base text-slate-500"
            >
              Sign in to access your dashboard
            </motion.p>

            <motion.div variants={fadeUp}>
              <LoginForm
                identifier={identifier}
                setIdentifier={setIdentifier}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                remember={remember}
                setRemember={setRemember}
                loading={loading}
                error={error}
                handleSubmit={handleSubmit}
              />
            </motion.div>

            <div className="mt-auto h-[12vh]" />
          </motion.div>
        </section>

        {/* DESKTOP ONLY */}
        <section className="hidden min-h-screen items-center justify-center px-8 py-8 lg:flex">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="show"
            className="w-full max-w-6xl rounded-[2.5rem] bg-white/50 p-8 shadow-[0_35px_120px_rgba(41,98,210,0.18)] backdrop-blur-xl"
          >
            <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-2">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="px-12 py-14"
              >
                <motion.div
                  variants={fadeLeft}
                  className="mb-12 flex items-center gap-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Image
                      src="/logo.jpg"
                      alt="logo"
                      width={70}
                      height={70}
                      className="rounded-xl"
                    />
                  </motion.div>

                  <div>
                    <h1 className="text-3xl font-black tracking-wide">
                      AL-AZEEZ
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
                      International School
                    </p>
                    <p className="text-xs font-semibold text-amber-500">
                      Knowledge. Faith. Perseverance.
                    </p>
                  </div>
                </motion.div>

                <motion.h2 variants={fadeUp} className="text-4xl font-black">
                  Welcome Back! 👋
                </motion.h2>

                <motion.p variants={fadeUp} className="mt-3 text-slate-500">
                  Sign in to access your student management dashboard
                </motion.p>

                <motion.div variants={fadeUp}>
                  <LoginForm
                    identifier={identifier}
                    setIdentifier={setIdentifier}
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    remember={remember}
                    setRemember={setRemember}
                    loading={loading}
                    error={error}
                    handleSubmit={handleSubmit}
                  />
                </motion.div>
              </motion.div>

              <motion.div
                variants={fadeRight}
                initial="hidden"
                animate="show"
                className="relative flex min-h-[620px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 px-10 text-white"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.12, 1],
                    rotate: [0, 6, 0],
                    opacity: [0.2, 0.35, 0.2],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -left-24 -top-24 h-80 w-80 rounded-full border border-white/20"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.16, 1],
                    opacity: [0.12, 0.28, 0.12],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -left-10 -top-10 h-60 w-60 rounded-full border border-white/10"
                />

                <motion.div
                  animate={{ y: [0, -10, 0], opacity: [0.25, 0.45, 0.25] }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute right-10 top-10 grid grid-cols-5 gap-2"
                >
                  {Array.from({ length: 25 }).map((_, i) => (
                    <span key={i} className="h-1 w-1 rounded-full bg-white" />
                  ))}
                </motion.div>

                <motion.div
                  animate={{ y: [0, -8, 0], scale: [1, 1.04, 1] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl"
                >
                  <GraduationCap size={46} className="text-blue-600" />
                </motion.div>

                <motion.h3
                  variants={fadeUp}
                  className="relative z-10 max-w-sm text-center text-4xl font-black leading-tight"
                >
                  Manage Students. Track Progress. Build Excellence.
                </motion.h3>

                <motion.p
                  variants={fadeUp}
                  className="relative z-10 mt-6 max-w-sm text-center leading-7 text-blue-50"
                >
                  A secure school management system for academics, attendance,
                  finance and communication.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="relative z-10 mt-10 flex gap-3"
                >
                  <span className="h-1.5 w-16 rounded-full bg-white" />
                  <span className="h-1.5 w-16 rounded-full bg-white/20" />
                  <span className="h-1.5 w-16 rounded-full bg-white/20" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.45, ease: premiumEase }}
                  className="absolute bottom-[-35px] right-[-5px] text-white/15"
                >
                  <School size={260} strokeWidth={1.1} />
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="mt-8 grid grid-cols-4 gap-6 rounded-[2rem] bg-white/80 p-8 shadow-lg"
            >
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Access",
                  text: "Protected login for all authorized users.",
                  color: "bg-blue-100 text-blue-600",
                },
                {
                  icon: Users,
                  title: "User Management",
                  text: "Manage students, teachers and parents.",
                  color: "bg-violet-100 text-violet-600",
                },
                {
                  icon: BarChart3,
                  title: "Track Progress",
                  text: "Monitor performance and records.",
                  color: "bg-emerald-100 text-emerald-600",
                },
                {
                  icon: BookOpenCheck,
                  title: "Academic Control",
                  text: "Manage classes, lessons and results.",
                  color: "bg-amber-100 text-amber-600",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div key={item.title} variants={fadeUp}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.06 }}
                      transition={{ duration: 0.4, ease: premiumEase }}
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${item.color}`}
                    >
                      <Icon size={24} />
                    </motion.div>

                    <h4 className="font-bold">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.text}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </section>
      </main>
    </MotionConfig>
  );
};

function LoginForm({
  identifier,
  setIdentifier,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  remember,
  setRemember,
  loading,
  error,
  handleSubmit,
}: any) {
  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: premiumEase }}
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
        >
          {error}
        </motion.p>
      )}

      <motion.div className="relative">
        <User
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          placeholder="Username"
          className="h-14 w-full rounded-xl border border-slate-200 bg-white/90 pl-12 pr-4 text-sm font-medium outline-none transition-all duration-500 focus:-translate-y-1 focus:border-blue-500 focus:bg-white focus:shadow-[0_18px_38px_rgba(37,99,235,0.13)] focus:ring-4 focus:ring-blue-100"
        />
      </motion.div>

      <motion.div className="relative">
        <Lock
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
          className="h-14 w-full rounded-xl border border-slate-200 bg-white/90 pl-12 pr-12 text-sm font-medium outline-none transition-all duration-500 focus:-translate-y-1 focus:border-blue-500 focus:bg-white focus:shadow-[0_18px_38px_rgba(37,99,235,0.13)] focus:ring-4 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </motion.div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-500">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Remember me
        </label>

        <button type="button" className="font-semibold text-blue-600">
          Forgot password?
        </button>
      </div>

      <motion.button
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.35, ease: premiumEase }}
        type="submit"
        disabled={loading}
        className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 font-bold text-white shadow-[0_18px_38px_rgba(37,99,235,0.38)] transition disabled:opacity-70"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <>
              <span>Signing you in</span>
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:300ms]" />
              </span>
            </>
          ) : (
            <>
              Sign In
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </>
          )}
        </span>
      </motion.button>
    </form>
  );
}

export default LoginPage;