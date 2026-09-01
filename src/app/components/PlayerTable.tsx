import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Trash2, Plus } from 'lucide-react';
import { Input } from './ui/input';

interface Player {
  id: string;
  name: string;
  age: number;
  dob: string;
  nationality: string;
  country: string;
  position: string;
  team: string;
}

export function PlayerTable() {
  const players: Player[] = [
    {
      id: '1',
      name: 'Abdul Karim Ayeh',
      age: 22,
      dob: '24/10/2003',
      nationality: 'Ghana',
      country: 'Ghana',
      position: 'ST, RW',
      team: 'Karela United'
    },
    // Add more mock players as needed
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PlayerTabs />
        <Input 
          type="text" 
          placeholder="Search player name..." 
          className="w-64"
        />
      </div>
      
      <div className="text-sm text-muted-foreground">
        Selected Years: <span className="font-medium">None</span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary text-chalk">
            <tr>
              <th className="px-4 py-3 text-left uppercase text-xs">Actions</th>
              <th className="px-4 py-3 text-left uppercase text-xs">Name</th>
              <th className="px-4 py-3 text-left uppercase text-xs">Age</th>
              <th className="px-4 py-3 text-left uppercase text-xs">DOB</th>
              <th className="px-4 py-3 text-left uppercase text-xs">Nationality</th>
              <th className="px-4 py-3 text-left uppercase text-xs">Country</th>
              <th className="px-4 py-3 text-left uppercase text-xs">Position</th>
              <th className="px-4 py-3 text-left uppercase text-xs">Team</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-midnight text-chalk">
              <td colSpan={9} className="px-4 py-2 font-medium">Strikers</td>
            </tr>
            <tr className="bg-accent">
              <td colSpan={9} className="px-4 py-2 text-sm text-muted-foreground">2003</td>
            </tr>
            {players.map((player) => (
              <tr key={player.id} className="border-b hover:bg-accent">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Checkbox />
                    <button className="p-2 bg-destructive text-chalk rounded hover:bg-destructive/80">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">{player.name}</td>
                <td className="px-4 py-3">{player.age}</td>
                <td className="px-4 py-3">{player.dob}</td>
                <td className="px-4 py-3">{player.nationality}</td>
                <td className="px-4 py-3">{player.country}</td>
                <td className="px-4 py-3">{player.position}</td>
                <td className="px-4 py-3">{player.team}</td>
                <td className="px-4 py-3">
                  <Button className="bg-primary hover:bg-primary/80">
                    <Plus className="w-4 h-4 mr-2" />
                    New Player
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerTabs() {
  return null; // This is handled by the parent component
}