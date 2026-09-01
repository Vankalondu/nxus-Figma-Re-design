import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Binoculars, MonitorPlay, LayoutDashboard, ShieldCheck } from 'lucide-react';
import welcomeMascot from 'figma:asset/6af486ef059ff902d44ec4f865e8a8673113d68d.png';

export default function LoginDepartment() {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const handleContinue = () => {
    if (!selectedDepartment) return;
    sessionStorage.setItem('selectedDepartment', selectedDepartment);
    navigate('/login-success');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-body">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}} />

      <div className="max-w-[1200px] w-full flex flex-col md:flex-row gap-6 min-h-[700px] animate-fade-in">
        
        {/* Left Side: Light Blue Rounded Section (Logo and Mascot only) */}
        <div className="w-full md:w-1/2 bg-card rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center p-10 relative overflow-hidden border border-chalk/50">
          <div className="absolute top-10 flex items-center space-x-3 bg-card/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-chalk/60">
            <div className="w-12 h-12 rounded-[16px] bg-primary text-chalk flex items-center justify-center font-heading font-black text-2xl shadow-md">
              Q
            </div>
            <div className="flex flex-col pr-2 text-left">
              <span className="font-heading font-extrabold text-[20px] leading-tight text-foreground tracking-tight">NXUS</span>
              <span className="font-heading font-bold text-[12px] tracking-[0.2em] text-foreground">SPORTS</span>
            </div>
          </div>

          <div className="w-full h-full flex items-center justify-center pt-20">
            <img 
              src={welcomeMascot} 
              alt="NXUS Mascot"
              className="w-[80%] h-auto object-contain rounded-[2.5rem] drop-shadow-2xl animate-float transition-transform duration-700"
            />
          </div>
        </div>

        {/* Right Side: Form / Select Mode (White Section) */}
        <div className="w-full md:w-1/2 bg-card rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center p-10 relative border border-chalk/50">
          <div className="max-w-md mx-auto w-full relative z-10">
            <h1 className="font-heading font-extrabold text-[32px] text-foreground mb-4 tracking-tight leading-tight">
              Select your Primary Mode
            </h1>
            <p className="text-muted-foreground text-[16px] mb-12 leading-relaxed font-medium">
              This choice is for your first-time setup only. You can switch modes later in your dashboard.
            </p>

            <div className="space-y-5 mb-10">
              {[
                { id: 'scout', name: 'Scout Mode', icon: Binoculars, desc: 'Player discovery & reports' },
                { id: 'video', name: 'Video Mode', icon: MonitorPlay, desc: 'Footage analysis & tagging' },
                { id: 'match', name: 'Match Entry', icon: LayoutDashboard, desc: 'Live game data & stats' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedDepartment(mode.id)}
                  className={`w-full flex items-center p-5 rounded-[24px] border-2 transition-all duration-300 text-left group ${
                    selectedDepartment === mode.id
                      ? 'border-primary bg-card shadow-[0_8px_20px_rgba(30,136,229,0.08)] transform scale-[1.02]'
                      : 'border-border hover:border-chalk hover:shadow-[0_8px_20px_rgba(6,27,46,0.08)] bg-card'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center mr-5 transition-colors duration-300 ${
                    selectedDepartment === mode.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-accent text-muted-foreground group-hover:text-foreground group-hover:bg-accent'
                  }`}>
                    <mode.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-[16px] mb-1 transition-colors ${selectedDepartment === mode.id ? 'text-foreground' : 'text-foreground'}`}>
                      {mode.name}
                    </h3>
                    <p className="text-[14px] text-muted-foreground font-medium">{mode.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 ${
                    selectedDepartment === mode.id ? 'border-primary bg-primary' : 'border-border bg-card'
                  }`}>
                    {selectedDepartment === mode.id && <div className="w-2.5 h-2.5 bg-card rounded-full" />}
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={handleContinue}
              disabled={!selectedDepartment}
              className={`w-full py-4 rounded-[20px] font-bold text-[16px] transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${
                selectedDepartment 
                  ? 'bg-primary hover:bg-primary/80 text-primary-foreground hover:shadow-[0_8px_30px_rgba(30,136,229,0.3)] transform hover:-translate-y-1' 
                  : 'bg-accent text-muted-foreground cursor-not-allowed'
              }`}
            >
              Continue to Dashboard
            </button>

            <div className="mt-10 pt-8 border-t border-border text-center">
              <div className="flex items-center justify-center space-x-2 text-[14px] text-muted-foreground font-medium">
                <ShieldCheck size={16} className="text-scout-green" />
                <span>Secure access to NXUS Sports System</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}