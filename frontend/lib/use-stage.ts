"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, runStage } from "@/lib/api";
import type { StageData, StageName } from "@/lib/types";

type State<T> =
  | { status: "loading" }
  | { status: "done"; data: T }
  | { status: "error"; error: ApiError };

export function useStage<S extends StageName>(projectId: string, stage: S) {
  const [state, setState] = useState<State<StageData[S]>>({ status: "loading" });
  const [run, setRun] = useState({ count: 0, refresh: false });

  useEffect(() => {
    let cancelled = false;
    runStage(projectId, stage, run.refresh).then(
      (data) => !cancelled && setState({ status: "done", data }),
      (error: ApiError) => !cancelled && setState({ status: "error", error }),
    );
    return () => {
      cancelled = true;
    };
  }, [projectId, stage, run]);

  const reload = useCallback((refresh = false) => {
    setState({ status: "loading" });
    setRun((r) => ({ count: r.count + 1, refresh }));
  }, []);

  return { ...state, reload };
}
