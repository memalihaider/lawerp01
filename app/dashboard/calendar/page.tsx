"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";

const events = [
  { id: 1, title: "Deposition - Henderson v. Global Mfg", date: "2026-03-10", time: "09:00 AM", duration: "3 hrs", type: "deposition", location: "Conference Room A", attorney: "James Okafor" },
  { id: 2, title: "Client Meeting - TechCorp Acquisition", date: "2026-03-10", time: "02:00 PM", duration: "1 hr", type: "meeting", location: "Office 401", attorney: "Margaret Chen" },
  { id: 3, title: "Court Hearing - Martinez Custody", date: "2026-03-12", time: "10:00 AM", duration: "2 hrs", type: "hearing", location: "Family Court, Dept. 5", attorney: "Sofia Ramirez" },
  { id: 4, title: "Filing Deadline - Patent App #3", date: "2026-03-14", time: "05:00 PM", duration: "", type: "deadline", location: "", attorney: "David Kim" },
  { id: 5, title: "Team Meeting - Litigation Dept", date: "2026-03-11", time: "11:00 AM", duration: "1 hr", type: "meeting", location: "Main Conference Room", attorney: "James Okafor" },
  { id: 6, title: "Zoning Board Hearing - Apex Tower", date: "2026-03-18", time: "09:30 AM", duration: "4 hrs", type: "hearing", location: "City Hall, Room 204", attorney: "Aisha Patel" },
  { id: 7, title: "Estate Planning Review - Whitfield", date: "2026-03-15", time: "03:00 PM", duration: "1.5 hrs", type: "meeting", location: "Office 302", attorney: "William Hartford" },
  { id: 8, title: "Discovery Response Due - Henderson", date: "2026-03-20", time: "11:59 PM", duration: "", type: "deadline", location: "", attorney: "James Okafor" },
  { id: 9, title: "Partner Meeting", date: "2026-03-13", time: "08:30 AM", duration: "1 hr", type: "meeting", location: "Executive Board Room", attorney: "Margaret Chen" },
  { id: 10, title: "Mediation - Contract Dispute", date: "2026-03-19", time: "10:00 AM", duration: "6 hrs", type: "hearing", location: "ADR Center, Suite 500", attorney: "Margaret Chen" },
];

const typeColors: Record<string, string> = {
  meeting: "bg-info/10 text-info border-info/30",
  hearing: "bg-danger/10 text-danger border-danger/30",
  deadline: "bg-warning/10 text-warning border-warning/30",
  deposition: "bg-accent/20 text-accent-dark border-accent/30",
};

const typeBadge: Record<string, string> = {
  meeting: "bg-info text-white",
  hearing: "bg-danger text-white",
  deadline: "bg-warning text-white",
  deposition: "bg-accent-dark text-white",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-03-10");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  const upcomingEvents = [...events].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted text-sm">Court dates, deadlines, meetings, and depositions</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">{monthName}</h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-2 hover:bg-muted-light rounded-lg text-muted"><ChevronLeft size={18} /></button>
              <button onClick={nextMonth} className="p-2 hover:bg-muted-light rounded-lg text-muted"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-muted mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2 font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-2 rounded-lg text-sm min-h-[60px] flex flex-col items-center transition-colors ${
                    isSelected ? "bg-primary text-white" : dayEvents.length > 0 ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted-light"
                  }`}
                >
                  <span className="font-medium">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : ev.type === "hearing" ? "bg-danger" : ev.type === "deadline" ? "bg-warning" : ev.type === "deposition" ? "bg-accent-dark" : "bg-info"}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-border text-xs text-muted">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-info" /> Meeting</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-danger" /> Hearing</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-warning" /> Deadline</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent-dark" /> Deposition</div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Selected Day */}
          {selectedDate && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-3">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted">No events scheduled</p>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map((ev) => (
                    <div key={ev.id} className={`rounded-lg border p-3 ${typeColors[ev.type]}`}>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold">{ev.title}</h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeBadge[ev.type]} capitalize`}>{ev.type}</span>
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5"><Clock size={12} /> {ev.time} {ev.duration && `(${ev.duration})`}</div>
                        {ev.location && <div className="flex items-center gap-1.5"><MapPin size={12} /> {ev.location}</div>}
                        <div className="flex items-center gap-1.5"><Users size={12} /> {ev.attorney}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3">All Events</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {upcomingEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedDate(ev.date)}
                  className="w-full text-left p-2 rounded-lg hover:bg-muted-light text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`w-2 h-2 rounded-full ${ev.type === "hearing" ? "bg-danger" : ev.type === "deadline" ? "bg-warning" : ev.type === "deposition" ? "bg-accent-dark" : "bg-info"}`} />
                    <span className="font-medium text-foreground truncate">{ev.title}</span>
                  </div>
                  <div className="text-muted ml-4">{ev.date} at {ev.time}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
