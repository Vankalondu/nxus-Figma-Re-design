import { Button } from './ui/button';

export function PlayerTabs() {
  const tabs = ['All Players', 'Player Ladder', 'Direct Player'];
  
  return (
    <div className="flex gap-2">
      {tabs.map((tab, index) => (
        <Button
          key={tab}
          variant={index === 0 ? 'default' : 'outline'}
          className={index === 0 ? 'bg-primary hover:bg-primary/80' : ''}
        >
          {tab}
        </Button>
      ))}
    </div>
  );
}
