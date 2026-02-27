import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { api, ApiError } from "../../api/client";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.auth.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Save token and user data to localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect to admin dashboard
      navigate("/admin");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-[6px_6px_15px_-3px_rgba(0,0,0,0.4)]">
        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white z-20" size={14} />
        <input 
          type="text" 
          placeholder="FULL NAME" 
          value={formData.name}
          onChange={handleChange('name')}
          disabled={isLoading}
          className="w-full bg-black text-white py-4 pl-14 pr-4 
          outline-none text-[10px] font-bold tracking-widest relative z-10 bg-transparent
          disabled:opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#5E35B1]/90 z-0" />
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-[6px_6px_15px_-3px_rgba(0,0,0,0.4)]">
        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white z-20" size={14} />
        <input 
          type="email" 
          placeholder="EMAIL" 
          value={formData.email}
          onChange={handleChange('email')}
          disabled={isLoading}
          className="w-full bg-black text-white py-4 pl-14 pr-4 
          outline-none text-[10px] font-bold tracking-widest relative z-10 bg-transparent
          disabled:opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#5E35B1]/90 z-0" />
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-[6px_6px_15px_-3px_rgba(0,0,0,0.4)]">
        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white z-20" size={14} />
        <input 
          type={showPassword ? "text" : "password"} 
          placeholder="PASSWORD"
          value={formData.password}
          onChange={handleChange('password')}
          disabled={isLoading}
          className="w-full bg-black text-white py-4 pl-14 pr-12 
          outline-none text-[10px] font-bold tracking-widest relative z-10 bg-transparent
          disabled:opacity-50"
        />
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 
          hover:text-white transition-colors z-30 disabled:opacity-50"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 
        to-[#5E35B1]/90 z-0" />
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-[6px_6px_15px_-3px_rgba(0,0,0,0.4)]">
        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white z-20" size={14} />
        <input 
          type={showConfirmPassword ? "text" : "password"} 
          placeholder="CONFIRM PASSWORD"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          disabled={isLoading}
          className="w-full bg-black text-white py-4 pl-14 pr-12 
          outline-none text-[10px] font-bold tracking-widest relative z-10 bg-transparent
          disabled:opacity-50"
        />
        <button 
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          disabled={isLoading}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 
          hover:text-white transition-colors z-30 disabled:opacity-50"
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 
        to-[#5E35B1]/90 z-0" />
      </div>

      <button 
        type="submit"
        disabled={isLoading}
        className="mt-4 bg-gradient-to-r from-[#B2EBF2] to-[#5E35B1] 
          text-black font-black py-4 rounded-xl 
          uppercase tracking-[0.3em] text-[11px] 
          
          shadow-[8px_8px_20px_-5px_rgba(94,53,177,0.5)] 
          
          hover:brightness-105 active:scale-95 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        "
      >
        {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
      </button>
    </form>
  );
};

export default RegisterForm;
