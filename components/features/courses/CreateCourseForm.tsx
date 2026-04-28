"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { logger } from "@/lib/utils";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreateCourseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateCourseForm({ onSuccess, onCancel }: CreateCourseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    logger.info("Creating new course", formData);

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to create course");
      } else {
        toast.success("Course created successfully!");
        onSuccess();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      logger.error("Create course exception", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1 animate-in fade-in slide-in-from-top-2">
      <Input
        label="Course Name"
        placeholder="e.g. Advanced Mathematics"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        label="Course Code"
        placeholder="e.g. MATH-301"
        required
        value={formData.code}
        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
      />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          <Plus size={18} className="mr-2" />
          Create Course
        </Button>
      </div>
    </form>
  );
}
