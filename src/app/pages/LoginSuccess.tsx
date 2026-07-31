import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

export default function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Determine target dashboard based on selected mode and role
    const dept = sessionStorage.getItem('selectedDepartment') || 'scout';
    const role = sessionStorage.getItem('loginRole') || sessionStorage.getItem('userRole') || '';
    
    // Simulate loading/auth check
    const timer = setTimeout(() => {
      if (role === 'Senior Scout') {
        navigate('/senior-scout');
      } else if (role === 'Lead Scout') {
        navigate('/lead-scout');
      } else if (role === 'Head Scout') {
        navigate('/head-scout');
      } else if (role === 'Video Manager') {
        navigate('/video-manager');
      } else if (role === 'Video Uploader' || role === 'Video Editor' || role === 'Basic Data Entry' || role === 'Detailed Data Entry' || role === 'Advanced Data Entry') {
        navigate('/matches');
      } else {
        navigate('/country-scout');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-body overflow-hidden relative">
      <style dangerouslySetInnerHTML={{__html: `
        .pulse-glow {
          animation: pulse-glow 3s infinite alternate;
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 40px rgba(30, 136, 229, 0.2); }
          100% { box-shadow: 0 0 80px rgba(30, 136, 229, 0.6); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}} />

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-card/40 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center text-center">
        <div className="relative w-56 h-56 md:w-72 md:h-72 mb-10 pulse-glow rounded-full bg-primary shadow-[var(--shadow-2xl)] flex items-center justify-center border-8 border-white/50 overflow-hidden animate-float">
          <span className="font-heading font-black text-chalk text-[100px] md:text-[130px] leading-none">Q</span>
        </div>

        <h1 className="font-heading font-extrabold text-5xl text-foreground mb-4 tracking-tight drop-shadow-sm">
          Welcome to NXUS
        </h1>
        
        <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed mb-8">
          Hang tight! We're preparing your scouting environment and syncing the latest player data.
        </p>

        <div className="bg-card/80 backdrop-blur-md border border-white shadow-xl rounded-full px-6 py-3 flex items-center space-x-4">
          <Loader2 className="w-5 h-5 text-foreground animate-spin shrink-0" />
          <div className="font-bold text-foreground text-sm">Onboarding you into the system...</div>
        </div>
      </div>
    </div>
  );
}