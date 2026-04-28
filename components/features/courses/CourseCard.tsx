import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, BookOpen, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface CourseCardProps {
  id: string;
  name: string;
  code: string;
  totalScans: number;
  createdAt: Date;
}

export function CourseCard({ id, name, code, totalScans, createdAt }: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full hover:border-primary/40 transition-all duration-300 group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="bg-primary/10 p-2 rounded-lg text-primary mb-3">
            <BookOpen size={20} />
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-secondary rounded-full text-secondary-foreground">
            {code}
          </span>
        </div>
        <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">{name}</CardTitle>
        <CardDescription>Created on {format(new Date(createdAt), "MMM d, yyyy")}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={16} className="text-primary" />
          <span>{totalScans} attendance records</span>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t border-border/50">
        <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-primary/5">
          <Link href={`/lecturer/courses/${id}`}>
            View Details
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
