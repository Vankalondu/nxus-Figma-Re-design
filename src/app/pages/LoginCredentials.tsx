import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Eye, ShieldCheck, Mail, Lock, ChevronDown } from 'lucide-react';

export default function LoginCredentials() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('');

  useEffect(() => {
    const dept = sessionStorage.getItem('selectedDepartment');
    if (dept) setDepartment(dept);
  }, []);

  const getRoles = () => {
    if (department === 'scout') return ['Country Scout', 'Head Scout', 'Senior Scout'];
    if (department === 'video') return ['Video Uploader', 'Video Editor', 'Video Manager'];
    if (department === 'match') return ['Basic Data Entry', 'Detailed Data Entry', 'Advanced Data Entry'];
    return ['Admin', 'Manager', 'User'];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      let role = 'Country Scout'; // Default
      const emailLower = email.toLowerCase();
      
      // Detect role from email domain (@country, @head, @lead, @senior)
      if (emailLower.includes('@senior') || emailLower.startsWith('senior')) role = 'Senior Scout';
      else if (emailLower.includes('@lead') || emailLower.startsWith('lead')) role = 'Lead Scout';
      else if (emailLower.includes('@head') || emailLower.startsWith('head')) role = 'Head Scout';
      else if (emailLower.includes('@country') || emailLower.startsWith('country')) role = 'Country Scout';
      // Legacy / other department roles
      else if (emailLower.includes('uploader')) role = 'Video Uploader';
      else if (emailLower.includes('manager')) role = 'Video Manager';
      else if (emailLower.includes('editor')) role = 'Video Editor';
      else if (emailLower.includes('basic')) role = 'Basic Data Entry';
      else if (emailLower.includes('detailed')) role = 'Detailed Data Entry';
      else if (emailLower.includes('advanced')) role = 'Advanced Data Entry';

      // Store both current view role and immutable login role
      sessionStorage.setItem('userRole', role);
      sessionStorage.setItem('loginRole', role);

      // Mode-picker is bypassed — go straight to the success interstitial,
      // which routes to the correct role dashboard.
      navigate('/login-success');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 font-body">
      <div className="max-w-[1200px] w-full flex flex-col md:flex-row gap-6 md:min-h-[700px] animate-fade-in">
        {/* Left Side - Form Area (No Logo) */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-card rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative">
          <div className="max-w-md mx-auto w-full relative z-10">
            <h1 className="font-heading font-extrabold text-[32px] text-foreground mb-4 tracking-tight leading-tight">
              Sign In
            </h1>
            <p className="text-muted-foreground text-[16px] mb-12 leading-relaxed font-medium">
              Enter your credentials to access your secure scouting workspace and player databases.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 mb-10">

              <div>
                <label className="block text-[14px] font-extrabold text-foreground mb-3">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="h-[22px] w-[22px] text-muted-foreground" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-[52px] pr-5 py-4 border-2 border-border rounded-[20px] text-[15px] focus:ring-4 focus:ring-ring/20 focus:border-ring transition-all bg-card hover:border-border text-foreground font-bold placeholder-muted-foreground shadow-[0_4px_12px_rgba(0,0,0,0.02)]" 
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-extrabold text-foreground mb-3">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-[22px] w-[22px] text-muted-foreground" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-[52px] pr-[52px] py-4 border-2 border-border rounded-[20px] text-[15px] focus:ring-4 focus:ring-ring/20 focus:border-ring transition-all bg-card hover:border-border text-foreground font-bold placeholder-muted-foreground shadow-[0_4px_12px_rgba(0,0,0,0.02)]" 
                    placeholder="••••••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                    >
                      <Eye className="h-[22px] w-[22px]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center group cursor-pointer">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-5 w-5 text-foreground focus:ring-primary border-border rounded-[6px] cursor-pointer" />
                  <label htmlFor="remember-me" className="ml-3 block text-[14px] text-muted-foreground font-bold cursor-pointer group-hover:text-foreground transition-colors">
                    Remember me
                  </label>
                </div>
                <div className="text-[14px]">
                  <a href="#" className="font-extrabold text-foreground hover:text-foreground hover:underline underline-offset-4 transition-all">Forgot your password?</a>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-10 py-4 rounded-[20px] font-bold text-[16px] transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-primary hover:bg-primary/80 text-primary-foreground hover:shadow-[0_8px_30px_rgba(30,136,229,0.3)] transform hover:-translate-y-1"
              >
                Sign In securely
              </button>
            </form>

            <div className="pt-8 border-t border-border text-center">
              <div className="flex items-center justify-center space-x-2 text-[14px] text-muted-foreground font-medium">
                <ShieldCheck size={16} className="text-green-500" />
                <span>Protected by NXUS Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Branded panel (hidden on mobile) */}
        <div className="hidden md:flex w-full md:w-1/2 bg-primary rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex-col items-center justify-center p-10 relative overflow-hidden">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 rounded-[28px] bg-white/10 backdrop-blur-md text-chalk flex items-center justify-center font-heading font-black text-5xl shadow-md">
              Q
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading font-extrabold text-[36px] leading-none text-chalk tracking-tight">NXUS</span>
              <span className="font-heading font-bold text-[16px] tracking-[0.35em] text-chalk/70">SPORTS</span>
            </div>
            <p className="font-body font-medium text-[15px] text-chalk/70 max-w-[280px] leading-relaxed mt-2">
              The professional football scouting terminal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}