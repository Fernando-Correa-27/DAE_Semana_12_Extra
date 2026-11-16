// PART 3 - the hook of the exams screen: the list with its three states, delete and create.
// Run it with:  npm test -- useExams
//
// It must return { status, exams, error, actionError, saving, reload, remove, create }:
//   status       "loading" | "ready" | "error"   (the three states of the request that lists)
//   exams        the array of exams ([] while loading and on error)
//   error        the sentence for the person when the LIST failed (null otherwise); use describeError
//   actionError  the sentence when a delete or a create failed (null otherwise); the list stays as it was
//   saving       true while a create is in flight
//   reload()     asks for the list again (status goes back to "loading")
//   remove(id)   DELETE; when the server confirms, the exam disappears from `exams`; resolves true or false
//   create(title) POST; when the server confirms, the new exam is added; resolves true or false
//
// TODO 1: the state and a useEffect that lists, with the three states. The effect gets an AbortController and a
//         `cancelled` flag, and its cleanup sets the flag and aborts: a late answer must never overwrite a newer one.
// TODO 2: `reload` (a counter that is a dependency of the effect is enough).
// TODO 3: `remove` and `create`. NEVER swallow an error: set `actionError` with describeError. `create` must
//         ignore a second call while the first one is still in flight (use a ref: a state is too late).
//
// Rule of the course: no hook inside an if, a loop or after a return.
import { useCallback, useEffect, useRef, useState } from "react";
import { createExam, deleteExam, describeError, listExams } from "./api";

export default function useExams() {
  const [status, setStatus] = useState("loading");
  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const creatingRef = useRef(false);

  // TODO 1: list the exams and move between the three states. The cleanup aborts the request and marks the answer as
  // obsolete, so a slow response can never overwrite a newer one.
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setStatus("loading");
    setError(null);

    listExams({ signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setExams(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled || err?.code === "ERR_CANCELED") return;
        setExams([]);
        setError(describeError(err));
        setStatus("error");
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [attempt]);

  // TODO 2: ask for the list again; the counter is the effect's dependency.
  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  const remove = useCallback(async (id) => {
    setActionError(null);
    try {
      await deleteExam(id);
      // Team decision: update the list locally instead of asking for the whole list again. The DELETE response is the
      // server's confirmation, so no extra GET is needed and the row disappears without reloading the page.
      setExams((current) => current.filter((exam) => exam.id !== id));
      return true;
    } catch (err) {
      setActionError(describeError(err));
      return false;
    }
  }, []);

  const create = useCallback(async (title) => {
    // A ref changes immediately; state would still be false during the second click of the same render.
    if (creatingRef.current) return false;
    creatingRef.current = true;
    setSaving(true);
    setActionError(null);
    try {
      const exam = await createExam(title);
      setExams((current) => [...current, exam]);
      return true;
    } catch (err) {
      setActionError(describeError(err));
      return false;
    } finally {
      creatingRef.current = false;
      setSaving(false);
    }
  }, []);

  return { status, exams, error, actionError, saving, reload, remove, create };
}
