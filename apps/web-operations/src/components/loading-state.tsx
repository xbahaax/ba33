import { Card, CardContent } from "@ba33/ui-web";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "Chargement des données opérationnelles…",
}: LoadingStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}
