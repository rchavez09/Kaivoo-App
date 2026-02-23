import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseISO, isValid } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import TodayDashboard from '@/components/today/TodayDashboard';
import TaskDetailsDrawer from '@/components/TaskDetailsDrawer';
import MeetingDetailsDrawer from '@/components/MeetingDetailsDrawer';

const Today = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven date: /?date=2026-02-20 or defaults to today
  const selectedDate = useMemo(() => {
    const param = searchParams.get('date');
    if (param) {
      const parsed = parseISO(param);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  }, [searchParams]);

  const handleDateChange = useCallback((date: Date) => {
    const iso = date.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    if (iso === today) {
      setSearchParams({});
    } else {
      setSearchParams({ date: iso });
    }
  }, [setSearchParams]);

  // Task drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);

  // Meeting drawer
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);

  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setTaskDrawerOpen(true);
  }, []);

  const handleMeetingClick = useCallback((meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setMeetingDrawerOpen(true);
  }, []);

  return (
    <AppLayout>
      <TodayDashboard
        date={selectedDate}
        onDateChange={handleDateChange}
        onTaskClick={handleTaskClick}
        onMeetingClick={handleMeetingClick}
      />

      <TaskDetailsDrawer
        taskId={selectedTaskId}
        open={taskDrawerOpen}
        onOpenChange={setTaskDrawerOpen}
      />

      <MeetingDetailsDrawer
        meetingId={selectedMeetingId}
        open={meetingDrawerOpen}
        onOpenChange={setMeetingDrawerOpen}
      />
    </AppLayout>
  );
};

export default Today;
