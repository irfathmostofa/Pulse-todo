import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { TASK_TYPES } from "../lib/constants";
import { useAuth } from "./useAuth";

export function useTasks(dateISO) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    // Don't fetch if no user is authenticated
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Make sure every still-active recurring template has an instance for this date.
      const { data: templates, error: templatesErr } = await supabase
        .from("recurring_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true);

      if (templatesErr) {
        setError(templatesErr.message);
        setLoading(false);
        return;
      }

      const { data: existing, error: existingErr } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", dateISO)
        .order("priority", { ascending: true });

      if (existingErr) {
        setError(existingErr.message);
        setLoading(false);
        return;
      }

      const existingRecurringIds = new Set(
        existing.filter((t) => t.recurring_id).map((t) => t.recurring_id),
      );
      const missing = (templates || []).filter(
        (t) => !existingRecurringIds.has(t.id),
      );

      let merged = existing;
      if (missing.length > 0) {
        const startPriority = existing.length;
        const inserts = missing.map((tpl, idx) => ({
          date: dateISO,
          title: tpl.title,
          type: TASK_TYPES.RECURRING,
          recurring_id: tpl.id,
          user_id: user.id,
          status: "pending",
          priority: startPriority + idx,
        }));
        const { data: inserted, error: insertErr } = await supabase
          .from("tasks")
          .insert(inserts)
          .select();

        if (insertErr) {
          setError(insertErr.message);
        } else {
          merged = [...existing, ...inserted];
        }
      }

      merged.sort((a, b) => a.priority - b.priority);
      setTasks(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateISO, user]);

  // Add real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel("tasks_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadTasks();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = useCallback(
    async (title, type = TASK_TYPES.NEW) => {
      if (!user) {
        setError("You must be logged in to add tasks");
        return;
      }

      const trimmed = title.trim();
      if (!trimmed) return;

      const nextPriority = tasks.length;

      if (type === TASK_TYPES.RECURRING) {
        const { data: template, error: tplErr } = await supabase
          .from("recurring_tasks")
          .insert({
            title: trimmed,
            active: true,
            user_id: user.id,
          })
          .select()
          .single();

        if (tplErr) {
          setError(tplErr.message);
          return;
        }

        const { data: instance, error: instErr } = await supabase
          .from("tasks")
          .insert({
            date: dateISO,
            title: trimmed,
            type: TASK_TYPES.RECURRING,
            recurring_id: template.id,
            user_id: user.id,
            status: "pending",
            priority: nextPriority,
          })
          .select()
          .single();

        if (instErr) {
          setError(instErr.message);
          return;
        }
        setTasks((prev) => [...prev, instance]);
        return;
      }

      const { data, error: insErr } = await supabase
        .from("tasks")
        .insert({
          date: dateISO,
          title: trimmed,
          type: TASK_TYPES.NEW,
          user_id: user.id,
          status: "pending",
          priority: nextPriority,
        })
        .select()
        .single();

      if (insErr) {
        setError(insErr.message);
        return;
      }
      setTasks((prev) => [...prev, data]);
    },
    [dateISO, tasks.length, user],
  );

  // Recurring tasks share ONE completion state across every day they appear on
  const toggleComplete = useCallback(
    async (task) => {
      if (!user) return;

      const nextStatus = task.status === "done" ? "pending" : "done";
      const completedAt =
        nextStatus === "done" ? new Date().toISOString() : null;

      if (task.type === TASK_TYPES.RECURRING && task.recurring_id) {
        setTasks((prev) =>
          prev.map((t) =>
            t.recurring_id === task.recurring_id
              ? { ...t, status: nextStatus, completed_at: completedAt }
              : t,
          ),
        );

        const [{ error: updErr }, { error: activeErr }] = await Promise.all([
          supabase
            .from("tasks")
            .update({ status: nextStatus, completed_at: completedAt })
            .eq("recurring_id", task.recurring_id)
            .eq("user_id", user.id),
          supabase
            .from("recurring_tasks")
            .update({ active: nextStatus !== "done" })
            .eq("id", task.recurring_id)
            .eq("user_id", user.id),
        ]);

        if (updErr) setError(updErr.message);
        if (activeErr) setError(activeErr.message);
        return;
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: nextStatus, completed_at: completedAt }
            : t,
        ),
      );

      const { error: updErr } = await supabase
        .from("tasks")
        .update({ status: nextStatus, completed_at: completedAt })
        .eq("id", task.id)
        .eq("user_id", user.id);

      if (updErr) setError(updErr.message);
    },
    [user],
  );

  const convertToRecurring = useCallback(
    async (task) => {
      if (!user || task.type === TASK_TYPES.RECURRING) return;

      const { data: template, error: tplErr } = await supabase
        .from("recurring_tasks")
        .insert({
          title: task.title,
          active: true,
          user_id: user.id,
        })
        .select()
        .single();

      if (tplErr) {
        setError(tplErr.message);
        return;
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, type: TASK_TYPES.RECURRING, recurring_id: template.id }
            : t,
        ),
      );

      const { error: updErr } = await supabase
        .from("tasks")
        .update({ type: TASK_TYPES.RECURRING, recurring_id: template.id })
        .eq("id", task.id)
        .eq("user_id", user.id);

      if (updErr) setError(updErr.message);
    },
    [user],
  );

  const deleteTask = useCallback(
    async (taskId) => {
      if (!user) return;

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      const { error: delErr } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", user.id);
      if (delErr) setError(delErr.message);
    },
    [user],
  );

  const deleteRecurring = useCallback(
    async (recurringId) => {
      if (!user) return;

      setTasks((prev) => prev.filter((t) => t.recurring_id !== recurringId));
      const { error: delErr } = await supabase
        .from("recurring_tasks")
        .delete()
        .eq("id", recurringId)
        .eq("user_id", user.id);
      if (delErr) setError(delErr.message);
    },
    [user],
  );

  const reorder = useCallback(
    async (orderedIds) => {
      if (!user) return;

      setTasks((prev) => {
        const byId = Object.fromEntries(prev.map((t) => [t.id, t]));
        return orderedIds.map((id, idx) => ({ ...byId[id], priority: idx }));
      });

      const updates = orderedIds.map((id, idx) =>
        supabase
          .from("tasks")
          .update({ priority: idx })
          .eq("id", id)
          .eq("user_id", user.id),
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed) setError(failed.error.message);
    },
    [user],
  );

  // NEW: Edit task function
  const editTask = useCallback(
    async (taskId, newTitle) => {
      if (!user) {
        setError("You must be logged in to edit tasks");
        return;
      }

      const trimmed = newTitle.trim();
      if (!trimmed) return;

      // Find the task to check if it's recurring
      const taskToEdit = tasks.find((t) => t.id === taskId);
      if (!taskToEdit) {
        setError("Task not found");
        return;
      }

      // Optimistically update UI
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, title: trimmed } : t)),
      );

      // If it's a recurring task, update both the task instance AND the recurring template
      if (taskToEdit.type === TASK_TYPES.RECURRING && taskToEdit.recurring_id) {
        // Update the task instance
        const { error: taskErr } = await supabase
          .from("tasks")
          .update({ title: trimmed })
          .eq("id", taskId)
          .eq("user_id", user.id);

        if (taskErr) {
          setError(taskErr.message);
          // Revert optimistic update
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, title: taskToEdit.title } : t,
            ),
          );
          return;
        }

        // Update the recurring template
        const { error: templateErr } = await supabase
          .from("recurring_tasks")
          .update({ title: trimmed })
          .eq("id", taskToEdit.recurring_id)
          .eq("user_id", user.id);

        if (templateErr) {
          setError(templateErr.message);
          // Revert optimistic update
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, title: taskToEdit.title } : t,
            ),
          );
          return;
        }
      } else {
        // For regular tasks, just update the task
        const { error: taskErr } = await supabase
          .from("tasks")
          .update({ title: trimmed })
          .eq("id", taskId)
          .eq("user_id", user.id);

        if (taskErr) {
          setError(taskErr.message);
          // Revert optimistic update
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, title: taskToEdit.title } : t,
            ),
          );
          return;
        }
      }
    },
    [tasks, user],
  );

  return {
    tasks,
    loading,
    error,
    addTask,
    toggleComplete,
    deleteTask,
    deleteRecurring,
    convertToRecurring,
    reorder,
    editTask,
    refetch: loadTasks,
  };
}
