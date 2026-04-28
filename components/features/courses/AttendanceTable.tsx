"use client";

import { format } from "date-fns";
import { 
  User, 
  Hash, 
  Clock, 
  Calendar,
  ChevronDown,
  ChevronRight,
  Search
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface AttendanceRecord {
  id: string;
  timestamp: string;
  student: {
    firstName: string;
    lastName: string;
    studentId: string;
    email: string;
  };
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Group by date
  const grouped = records.reduce((acc, record) => {
    const dateKey = format(new Date(record.timestamp), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const filteredRecords = (dateRecords: AttendanceRecord[]) => {
    if (!searchQuery) return dateRecords;
    return dateRecords.filter(r => 
      `${r.student.firstName} ${r.student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Filter students by name or ID..."
          className="pl-10 h-11 rounded-xl bg-card"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => {
            const dateRecords = filteredRecords(grouped[date]);
            if (dateRecords.length === 0 && searchQuery) return null;
            
            const isExpanded = expandedDates[date] !== false; // Default to expanded

            return (
              <Card key={date} className="overflow-hidden p-0 border-border/60">
                <button
                  onClick={() => toggleDate(date)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">
                        {format(new Date(date), "EEEE, MMMM d, yyyy")}
                      </h4>
                      <p className="text-xs text-muted-foreground">{dateRecords.length} students present</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border/50">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/20 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-6 py-4 flex items-center gap-2">
                              <User size={12} /> Student Name
                            </th>
                            <th className="px-6 py-4">
                              <div className="flex items-center gap-2"><Hash size={12} /> Student ID</div>
                            </th>
                            <th className="px-6 py-4">
                              <div className="flex items-center gap-2"><Clock size={12} /> Timestamp</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {dateRecords.map((record) => (
                            <tr key={record.id} className="hover:bg-primary/5 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground">
                                    {record.student.firstName} {record.student.lastName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{record.student.email}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-border">
                                  {record.student.studentId}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">
                                {format(new Date(record.timestamp), "HH:mm:ss")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl text-muted-foreground">
            <p>No attendance records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
