import { Button } from './ui/button';

export function ViewTabs() {
  const tabs = ['Long', 'Short', 'Target', 'Database', 'Settings'];
  
  return (
    <div className="flex gap-2">
      {tabs.map((tab, index) => (
        <Button
          key={tab}
          variant={index === 0 ? 'default' : 'outline'}
          className={index === 0 ? 'bg-brand-primary hover:bg-brand-primary/80' : ''}
        >
          {tab}
        </Button>
      ))}
    </div>
  );
}
