import { Card, CardContent } from "@/components/ui/card";

interface EmotionCardProps {
  title: string;
  emotion: string;
}

export default function EmotionCard({ title, emotion }: EmotionCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-center font-bold text-xl">{emotion}</p>
      </CardContent>
    </Card>
  );
}
