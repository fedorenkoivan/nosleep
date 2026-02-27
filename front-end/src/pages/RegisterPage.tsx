import RegisterForm from "../components/auth/RegisterForm";
import flower from "../images/element1.png";
import circle1 from "../images/element11.png";
import ourlogo from "../images/logo.jpg";
import { Link } from "react-router-dom";

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center 
    relative overflow-hidden font-sans">
      
      <div className="absolute inset-0 z-0 opacity-35 pointer-events-none flex flex-col justify-around py-4">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className={`animate-marquee flex gap-40 ${i % 2 === 0 ? '' : 'pl-30'}`} 
          >
             {[...Array(10)].map((_, j) => (
               <img key={j} src={ourlogo} className="h-20 w-auto" alt="logo" /> 
             ))}
             {[...Array(10)].map((_, j) => (
               <img key={`r-${j}`} src={ourlogo} className="h-20 w-auto" alt="logo" />
             ))}
          </div>
        ))}
      </div>

      <img 
        src={circle1} 
        className="absolute top-[-10px] left-[-30px] w-[220px] animate-float z-0 blur-[1px]" 
        alt="circle" 
      />
      <img 
        src={flower} 
        className="absolute bottom-[-20px] right-[-50px] w-[300px] animate-float z-0" 
        style={{ animationDelay: '3s' }} 
        alt="flower" 
      />

      <div className="bg-[#E1F5FE]/95 backdrop-blur-md 
                      rounded-[20px] shadow-2xl z-10 w-full 
                      max-w-[380px] 
                      pt-[50px] pb-[40px] px-[55px] text-center mx-4"> 
        
        <h1 className="text-black text-2xl font-black tracking-[0.2em] uppercase">Create Account</h1>
        
        <p className="mt-[35px] text-gray-500 font-bold text-[9px] tracking-[0.2em] uppercase leading-tight">
          Sign up to get started <br /> with our platform
        </p>
        
        <div className="mt-[35px]"> 
          <RegisterForm />
        </div>

        <div className="mt-6">
          <p className="text-gray-600 text-xs">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-[#5E35B1] font-bold hover:text-[#7E57C2] transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
