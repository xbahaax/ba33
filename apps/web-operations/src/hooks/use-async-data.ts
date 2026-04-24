"use client";

import { type DependencyList, useEffect, useState } from "react";

interface AsyncDataState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refresh: () => void;
  updatedAt: number | null;
}

export function useAsyncData<T>(
  loader: () => Promise<T | null>,
  deps: DependencyList = [],
): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (!active) {
          return;
        }

        setData(result);

        if (result) {
          setUpdatedAt(Date.now());
          return;
        }

        setError("Aucune donnée exploitable n'a été retournée par l'API.");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setData(null);
        setError("Impossible de récupérer les données depuis l'API.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [...deps, refreshIndex]);

  return {
    data,
    error,
    loading,
    refresh: () => setRefreshIndex((value) => value + 1),
    updatedAt,
  };
}
