import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MoreVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './ui/button';

interface Territory {
  id: number;
  name: string;
  countries: string[];
}

export function TerritoriesTable() {
  const territories: Territory[] = [
    {
      id: 1,
      name: 'Manor River Union',
      countries: ['Guinea', 'Liberia', 'Sierra Leone']
    },
    {
      id: 2,
      name: 'SADC (Southern African Development Community)',
      countries: ['Angola', 'Botswana', 'Comoros', 'Congo DR', 'Eswatini', 'Lesotho', 'Madagascar', 'Malawi', 'Mauritius', 'Mozambique', 'Namibia', 'Seychelles', 'South Africa', 'Tanzania', 'Zambia', 'Zimbabwe']
    },
    {
      id: 3,
      name: 'Sahel',
      countries: ['Algeria', 'Egypt', 'Morocco']
    },
    {
      id: 4,
      name: 'Test Territory',
      countries: ['Kenya', 'Tanzania', 'Uganda']
    },
    {
      id: 5,
      name: 'UNIFFAC (Central African Football Federations\' Union)',
      countries: ['Cameroon', 'Central African Republic', 'Chad', 'Congo', 'Congo DR', 'Equatorial Guinea', 'Gabon', 'São Tomé and Príncipe']
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-foreground">Territories</h2>
      </div>

      <div className="flex items-center justify-between">
        <Input 
          type="text" 
          placeholder="Search all columns..." 
          className="w-80"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Number of rows:</span>
          <Select defaultValue="10">
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left w-16">No.</th>
              <th className="px-4 py-3 text-left">Territory</th>
              <th className="px-4 py-3 text-left">Countries</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {territories.map((territory) => (
              <tr key={territory.id} className="border-b hover:bg-accent">
                <td className="px-4 py-3 text-muted-foreground">{territory.id}.</td>
                <td className="px-4 py-3">{territory.name}</td>
                <td className="px-4 py-3 text-foreground">
                  {territory.countries.join(', ')}
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-secondary rounded">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total results: {territories.length}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Page 1 of 1
          </span>
          <Button variant="outline" size="icon" disabled>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" disabled>
            <ChevronsRight className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">Go to page:</span>
            <Input 
              type="number" 
              defaultValue="1" 
              className="w-16 text-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}