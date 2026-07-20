import React, { useState } from 'react';
import { X, Calendar, ChevronDown, Check, Camera } from 'lucide-react';

interface EditPlayerModalProps {
  player: {
    id: string;
    name: string;
    dob: string;
    nationality: string[];
    primaryPos: string;
    secondaryPos: string;
    tertiaryPos: string;
    preferredFoot: string;
    height: number;
    weight: number;
    initials: string;
  };
  onClose: () => void;
  onUpdate: (data: any) => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({ player, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ ...player });

  const positions = ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'CB', 'LB', 'RB', 'GK'];
  const countries = ['Senegal', 'Nigeria', 'Ghana', 'Cameroon', 'Mali', 'Côte d\'Ivoire', 'France', 'Belgium', 'England'];

  const handleRemoveNationality = (country: string) => {
    setFormData(prev => ({
      ...prev,
      nationality: prev.nationality.filter(c => c !== country)
    }));
  };

  const handleAddNationality = (country: string) => {
    if (!country || formData.nationality.includes(country)) return;
    setFormData(prev => ({
      ...prev,
      nationality: [...prev.nationality, country]
    }));
  };

  return (
    <div className="fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
      <div className="bg-card w-full max-w-3xl rounded-[24px] shadow-[var(--shadow-2xl)] border border-border flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header Tier */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-heading font-semibold text-[24px] text-foreground leading-none">Edit player</h2>
            <p className="font-body font-medium text-[14px] text-muted-foreground mt-2">(Required fields marked with *)</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Interior Layout Form Elements */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          {/* Central Avatar Selector */}
          <div className="flex justify-center">
            <div className="w-28 h-28 rounded-full bg-accent border-4 border-border/50 flex items-center justify-center text-primary font-heading font-black text-3xl relative group cursor-pointer overflow-hidden shadow-inner">
              {formData.initials}
              <div className="absolute inset-0 bg-[#061B2E]/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                 <Camera size={24} className="text-white mb-1" />
                 <span className="text-[10px] text-white uppercase font-black tracking-widest">Update</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Primary Identity Fields */}
            <div className="space-y-2">
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Name:*</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[15px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all placeholder:text-muted-foreground/40 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">DOB:</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={formData.dob}
                  readOnly
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[15px] font-bold text-foreground focus:outline-none transition-all cursor-pointer group-hover:border-primary shadow-sm"
                />
                <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>

            {/* Nationality Chip Collector Row */}
            <div className="space-y-4">
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Nationality:</label>
              <div className="relative group">
                <select 
                  onChange={(e) => handleAddNationality(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[15px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring appearance-none transition-all cursor-pointer group-hover:border-primary shadow-sm"
                  value=""
                >
                  <option value="" disabled>Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.nationality.map(country => (
                  <div key={country} className="flex items-center gap-2 bg-primary/5 border border-primary/20 px-4 py-2 rounded-full font-body font-bold text-[14px] text-foreground shadow-sm animate-fade-in">
                    {country}
                    <button onClick={() => handleRemoveNationality(country)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Column Position Matrix Track */}
            <div className="space-y-4">
              <div className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Positional Depth</div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Primary:', key: 'primaryPos' },
                  { label: 'Secondary:', key: 'secondaryPos' },
                  { label: 'Tertiary:', key: 'tertiaryPos' }
                ].map(pos => (
                  <div key={pos.key} className="space-y-2">
                    <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{pos.label}</label>
                    <div className="relative group">
                      <select 
                        value={formData[pos.key as keyof typeof formData] as string}
                        onChange={(e) => setFormData({...formData, [pos.key]: e.target.value})}
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring appearance-none transition-all cursor-pointer group-hover:border-primary shadow-sm"
                      >
                        <option value="">None</option>
                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical & Mechanical Metrics */}
            <div className="space-y-8 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Preferred foot</label>
                <div className="relative group">
                  <select 
                    value={formData.preferredFoot}
                    onChange={(e) => setFormData({...formData, preferredFoot: e.target.value})}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[15px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring appearance-none transition-all cursor-pointer group-hover:border-primary shadow-sm"
                  >
                    <option value="Left">Left</option>
                    <option value="Right">Right</option>
                    <option value="Ambidextrous">Ambidextrous</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Height (cm):</label>
                  <input 
                    type="number" 
                    value={formData.height}
                    onChange={e => setFormData({...formData, height: parseInt(e.target.value) || 0})}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[15px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Weight (kg):</label>
                  <input 
                    type="number" 
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[15px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Baseline */}
        <div className="px-8 py-6 border-t border-border flex justify-end shrink-0 bg-card shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => {
              onUpdate(formData);
              onClose();
            }}
            className="bg-primary text-primary-foreground hover:bg-[#0d2a45] px-12 py-4 rounded-xl font-heading font-black text-sm transition-all shadow-lg shadow-primary/20 uppercase tracking-widest flex items-center gap-2"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};
