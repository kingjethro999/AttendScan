"use client";

import { useState, useEffect } from "react";
import { CourseCard } from "@/components/features/courses/CourseCard";
import { CreateCourseForm } from "@/components/features/courses/CreateCourseForm";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Plus, BookOpen, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { logger } from "@/lib/utils";

interface Course {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  _count: {
    attendance: number;
  };
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      logger.error("Failed to fetch courses", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (c) => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">Manage your curriculum and track attendance.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="rounded-full px-6">
          <Plus size={20} className="mr-2" />
          New Course
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search by name or code..."
          className="pl-10 h-12 rounded-2xl bg-card border-border/60"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isCreating && (
        <Card className="border-primary/20 bg-primary/5 p-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Course</h3>
            </div>
            <CreateCourseForm 
              onSuccess={() => {
                setIsCreating(false);
                fetchCourses();
              }}
              onCancel={() => setIsCreating(false)}
            />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading your courses...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              name={course.name}
              code={course.code}
              totalScans={course._count.attendance}
              createdAt={new Date(course.createdAt)}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 py-24 flex flex-col items-center justify-center text-center">
          <div className="bg-muted p-4 rounded-full mb-4">
            <BookOpen size={40} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No courses found</h3>
          <p className="text-muted-foreground max-w-xs mt-2">
            {searchQuery 
              ? "We couldn't find any courses matching your search." 
              : "You haven't created any courses yet. Start by adding one!"}
          </p>
          {!searchQuery && (
            <Button variant="outline" onClick={() => setIsCreating(true)} className="mt-6">
              Create your first course
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
