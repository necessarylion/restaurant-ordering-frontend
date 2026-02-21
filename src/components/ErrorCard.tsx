import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorCardProps {
  title: string;
  message?: string;
}

export function ErrorCard({ title, message }: ErrorCardProps) {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {message || "Something went wrong"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
