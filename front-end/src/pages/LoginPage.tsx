import LoginForm from "../components/auth/LoginForm";
import flower from "../images/element1.png";
import circle1 from "../images/element11.png";
import ourlogo from "../images/logo.jpg";

export const LoginPage = () => {
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
        
        <h1 className="text-black text-2xl font-black tracking-[0.2em] uppercase">Welcome Back</h1>
        
        <p className="mt-[35px] text-gray-500 font-bold text-[9px] tracking-[0.2em] uppercase leading-tight">
          Please sign in to access <br /> the admin dashboard.
        </p>
        
        <div className="mt-[35px]"> 
          <LoginForm />
        </div>
      </div>
    </div>
  );
};