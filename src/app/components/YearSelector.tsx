import { Button } from './ui/button';
import { Settings } from 'lucide-react';

export function YearSelector() {
  const years = [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010];

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {years.map((year) => (
          <Button
            key={year}
            className="bg-primary hover:bg-primary/80"
          >
            {year}
          </Button>
        ))}
      </div>
      <button className="p-2 bg-primary rounded-full hover:bg-primary/80">
        <Settings className="w-5 h-5 text-chalk" />
      </button>
    </div>
  );
}