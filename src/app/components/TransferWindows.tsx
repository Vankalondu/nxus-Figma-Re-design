import { Button } from './ui/button';

export function TransferWindows() {
  const windows = [
    'Winter 2026',
    'Summer 2026',
    'Winter 2027',
    'Summer 2027',
    'Winter 2028',
    'Summer 2028',
    'Winter 2029',
    'Summer 2029',
  ];

  return (
    <div>
      <div className="mb-3 text-sm text-muted-foreground">
        Next Available Transfer Window: <span className="font-medium text-foreground">Winter 2026</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {windows.map((window) => (
          <Button
            key={window}
            className="bg-primary hover:bg-primary/80"
          >
            {window}
          </Button>
        ))}
      </div>
    </div>
  );
}