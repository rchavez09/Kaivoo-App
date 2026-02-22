import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseISO, isValid } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import { UnifiedDayView } from '@/components/day-view';
import JournalEntryDialog from '@/components/JournalEntryDialog';
import CaptureEditDialog from '@/components/CaptureEditDialog';
import TaskDetailsDrawer from '@/components/TaskDetailsDrawer';
import MeetingDetailsDrawer from '@/components/MeetingDetailsDrawer';

import { useKaivooActions } from '@/hooks/useKaivooActions';
import { JournalEntry, Capture } from '@/types';

const Today = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateJournalEntry, updateCapture } = useKaivooActions();

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

  // Journal edit dialog
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Capture edit dialog
  const [editingCapture, setEditingCapture] = useState<Capture | null>(null);
  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);

  // Task drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);

  // Meeting drawer
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);

  const handleEditEntry = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  }, []);

  const handleSaveEntry = useCallback((entry: JournalEntry) => {
    void updateJournalEntry(entry.id, entry);
  }, [updateJournalEntry]);

  const handleEditCapture = useCallback((capture: Capture) => {
    setEditingCapture(capture);
    setCaptureDialogOpen(true);
  }, []);

  const handleSaveCapture = useCallback((capture: Capture) => {
    void updateCapture(capture.id, capture);
  }, [updateCapture]);

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
      <UnifiedDayView
        date={selectedDate}
        onDateChange={handleDateChange}
        onTaskClick={handleTaskClick}
        onMeetingClick={handleMeetingClick}
        onEditJournal={handleEditEntry}
        onEditCapture={handleEditCapture}
      />

      <JournalEntryDialog
        entry={editingEntry}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveEntry}
      />

      <CaptureEditDialog
        capture={editingCapture}
        open={captureDialogOpen}
        onOpenChange={setCaptureDialogOpen}
        onSave={handleSaveCapture}
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
