import { useMemo, useState } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import DateStrip from "./components/DateStrip";
import MoodSelector from "./components/MoodSelector";
import TaskBoard from "./components/TaskBoard";
import Pomodoro from "./components/Pomodoro";
import Dashboard from "./components/Dashboard";
import Activity from "./components/Activity";
import Settings from "./components/Settings";
import Login from "./components/Login";
import { useTasks } from "./hooks/useTasks";
import { useMood } from "./hooks/useMood";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { toISODate, isToday } from "./lib/dateUtils";

export default function App() {
  const {
    session,
    user,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    updatePassword,
  } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateISO = useMemo(() => toISODate(selectedDate), [selectedDate]);
  const {
    tasks,
    loading,
    addTask,
    toggleComplete,
    deleteTask,
    deleteRecurring,
    convertToRecurring,
    reorder,
  } = useTasks(dateISO);
  const {
    mood,
    loading: moodLoading,
    error: moodError,
    setTodayMood,
  } = useMood(dateISO);

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const taskProgress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-sm text-ghost-faint">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Login onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <div className="min-h-screen bg-ink font-body">
      <div className="mx-auto max-w-3xl px-4 pt-6 pb-28 flex flex-col gap-6">
        <Header user={user} theme={theme} onToggleTheme={toggleTheme} />

        {activeTab === "tasks" && (
          <>
            <DateStrip selectedDate={selectedDate} onSelect={setSelectedDate} />

            {isToday(selectedDate) && (
              <MoodSelector
                selectedMood={mood?.mood}
                onSelect={setTodayMood}
                loading={moodLoading}
                error={moodError}
                taskProgress={taskProgress}
                tasks={tasks}
              />
            )}

            {loading ? (
              <p className="text-sm text-ghost-faint">Loading today's list…</p>
            ) : (
              <TaskBoard
                tasks={tasks}
                onAdd={addTask}
                onToggle={toggleComplete}
                onDelete={deleteTask}
                onDeleteRecurring={deleteRecurring}
                onConvertToRecurring={convertToRecurring}
                onReorder={reorder}
              />
            )}
          </>
        )}

        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "monthly" && <Activity theme={theme} />}
        {activeTab === "pomodoro" && <Pomodoro />}
        {activeTab === "settings" && (
          <Settings
            theme={theme}
            onToggleTheme={toggleTheme}
            user={user}
            onUpdatePassword={updatePassword}
            onSignOut={signOut}
          />
        )}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
