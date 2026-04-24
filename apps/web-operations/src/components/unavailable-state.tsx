import { Card, CardContent } from "@ba33/ui-web";

interface UnavailableStateProps {
  message: string;
}

export function UnavailableState({ message }: UnavailableStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}
