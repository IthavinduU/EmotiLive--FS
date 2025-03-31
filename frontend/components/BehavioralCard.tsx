// components/BehavioralCard.tsx

import { Card, CardContent } from "@/components/ui/card";

interface BehavioralCardProps {
  title: string;
  behavior: string;
}

export default function BehavioralCard({ title, behavior }: BehavioralCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-center font-bold text-xl">{behavior}</p>
      </CardContent>
    </Card>
  );
}
