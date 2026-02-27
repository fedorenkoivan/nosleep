import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={(e) => { e.preventDefault(); navigate("/admin"); }} className="flex flex-col gap-[18px]"> 

      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-[6px_6px_15px_-3px_rgba(0,0,0,0.4)]">
        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white z-20" size={14} />
        <input 
          type="text" 
          placeholder="USER" 
          className="w-full bg-black text-white py-4 pl-14 pr-4 
          outline-none text-[10px] font-bold tracking-widest relative z-10 bg-transparent"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#5E35B1]/90 z-0" />
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-[6px_6px_15px_-3px_rgba(0,0,0,0.4)]">
        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white z-20" size={14} />
        <input 
          type={showPassword ? "text" : "password"} 
          placeholder="PASSWORD" 
          className="w-full bg-black text-white py-4 pl-14 pr-12 
          outline-none text-[10px] font-bold tracking-widest relative z-10 bg-transparent"
        />
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 
          hover:text-white transition-colors z-30"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 
        to-[#5E35B1]/90 z-0" />
      </div>

      <button 
      type="submit"
      className="mt-4 bg-gradient-to-r from-[#B2EBF2] to-[#5E35B1] 
        text-black font-black py-4 rounded-xl 
        uppercase tracking-[0.3em] text-[11px] 
        
        shadow-[8px_8px_20px_-5px_rgba(94,53,177,0.5)] 
        
        hover:brightness-105 active:scale-95 transition-all
      "
    >
      Sign In
    </button>
    </form>
  );
};

export default LoginForm;