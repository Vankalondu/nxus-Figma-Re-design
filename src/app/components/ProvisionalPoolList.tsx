import { ArrowRight, Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  nationality: string;
  flag: string;
  submittedBy: string;
  grade: 'A' | 'B';
  photo: string;
}

const provisionalPoolPlayers: Player[] = [
  {
    id: 1,
    name: 'Chibueze Nwosu',
    position: 'CAM',
    age: 17,
    nationality: 'Nigeria',
    flag: '🇳🇬',
    submittedBy: 'Chidi Okafor',
    grade: 'A',
    photo: 'https://images.unsplash.com/photo-1606208397693-7d57d408cc4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIweW91bmclMjBzb2NjZXIlMjBwbGF5ZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI3MDYzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    name: 'Aminu Tijani',
    position: 'ST',
    age: 16,
    nationality: 'Nigeria',
    flag: '🇳🇬',
    submittedBy: 'Chidi Okafor',
    grade: 'A',
    photo: 'https://images.unsplash.com/photo-1688143030645-a84f15553f9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdlcmlhbiUyMGZvb3RiYWxsJTIwcGxheWVyJTIwaGVhZHNob3R8ZW58MXx8fHwxNzcyNzA2Mzc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    name: 'Kofi Mensah',
    position: 'CB',
    age: 18,
    nationality: 'Ghana',
    flag: '🇬🇭',
    submittedBy: 'Kwame Asante',
    grade: 'A',
    photo: 'https://images.unsplash.com/photo-1695640479993-73a1f7a1b909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaGFuYWlhbiUyMHNvY2NlciUyMGF0aGxldGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI3MDYzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 4,
    name: 'Idrissa Ba',
    position: 'CDM',
    age: 17,
    nationality: 'Senegal',
    flag: '🇸🇳',
    submittedBy: 'Amara Diallo',
    grade: 'B',
    photo: 'https://images.unsplash.com/photo-1715005881129-266ccdd75e43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW5lZ2FsZXNlJTIwZm9vdGJhbGwlMjBwbGF5ZXIlMjB5b3VuZ3xlbnwxfHx8fDE3NzI3MDYzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 5,
    name: 'Yaw Acheampong',
    position: 'RW',
    age: 16,
    nationality: 'Ghana',
    flag: '🇬🇭',
    submittedBy: 'Kwame Asante',
    grade: 'A',
    photo: 'https://images.unsplash.com/photo-1595188126266-cd4e0335bf3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGFmcmljYW4lMjBmb290YmFsbCUyMHBsYXllcnxlbnwxfHx8fDE3NzI3MDYzNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 6,
    name: 'Obinna Eze',
    position: 'LB',
    age: 17,
    nationality: 'Nigeria',
    flag: '🇳🇬',
    submittedBy: 'Chidi Okafor',
    grade: 'B',
    photo: 'https://images.unsplash.com/photo-1606208397693-7d57d408cc4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIweW91bmclMjBzb2NjZXIlMjBwbGF5ZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI3MDYzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 7,
    name: 'Sadio Diop',
    position: 'CM',
    age: 18,
    nationality: 'Senegal',
    flag: '🇸🇳',
    submittedBy: 'Amara Diallo',
    grade: 'A',
    photo: 'https://images.unsplash.com/photo-1615592018519-6c5c8c3f4c8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ3lwdGlhbiUyMGZvb3RiYWxsJTIwYXRobGV0ZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjcwNjM3NXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 8,
    name: 'Emmanuel Kone',
    position: 'GK',
    age: 17,
    nationality: 'Ivory Coast',
    flag: '🇨🇮',
    submittedBy: 'Didier Bamba',
    grade: 'B',
    photo: 'https://images.unsplash.com/photo-1616702678549-849defb252a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JvY2NhbiUyMHNvY2NlciUyMHBsYXllciUyMGhlYWRzaG90fGVufDF8fHx8MTc3MjcwNjM3NXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 9,
    name: 'Adeola Bakare',
    position: 'RB',
    age: 16,
    nationality: 'Nigeria',
    flag: '🇳🇬',
    submittedBy: 'Chidi Okafor',
    grade: 'A',
    photo: 'https://images.unsplash.com/photo-1688143030645-a84f15553f9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdlcmlhbiUyMGZvb3RiYWxsJTIwcGxheWVyJTIwaGVhZHNob3R8ZW58MXx8fHwxNzcyNzA2Mzc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 10,
    name: 'Kwasi Owusu',
    position: 'LW',
    age: 17,
    nationality: 'Ghana',
    flag: '🇬🇭',
    submittedBy: 'Kwame Asante',
    grade: 'B',
    photo: 'https://images.unsplash.com/photo-1695640479993-73a1f7a1b909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaGFuYWlhbiUyMHNvY2NlciUyMGF0aGxldGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI3MDYzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function ProvisionalPoolList() {
  return (
    <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e8edf2]">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#1E88E5]" />
          <h3 className="text-[#0a0e1a] font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>
            Top 10 Provisional Pool
          </h3>
        </div>
        <button className="text-[#1E88E5] text-sm hover:underline font-medium flex items-center gap-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Player List */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {provisionalPoolPlayers.map((player, index) => (
          <div
            key={player.id}
            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-[#f8fafc] border border-transparent hover:border-[#e8edf2] transition-all cursor-pointer"
          >
            {/* Rank */}
            <div className="text-[#94a3b8] text-sm font-semibold w-6 shrink-0 text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {index + 1}
            </div>

            {/* Player Photo */}
            <div className="relative shrink-0">
              <ImageWithFallback
                src={player.photo}
                alt={player.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <span className="absolute -bottom-1 -right-1 text-sm">{player.flag}</span>
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[#0a0e1a] font-semibold truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {player.name}
                </h4>
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold shrink-0 ${
                  player.grade === 'A' 
                    ? 'bg-[#E8F5E9] text-[#2E7D32]' 
                    : 'bg-[#E3F2FD] text-[#1565C0]'
                }`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Grade {player.grade}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span>{player.position}</span>
                <span>•</span>
                <span>{player.age} yrs</span>
                <span>•</span>
                <span className="truncate">Submitted by {player.submittedBy}</span>
              </div>
            </div>

            {/* Action Arrow */}
            <ArrowRight className="w-5 h-5 text-[#94a3b8] group-hover:text-[#1E88E5] transition-colors shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}