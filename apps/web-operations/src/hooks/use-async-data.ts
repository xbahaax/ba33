"use client";

import { type DependencyList, useEffect, useState } from "react";

interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
}

export function useAsyncData<T>(
  loader: () => Promise<T | null>,
  deps: DependencyList = [],
): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setLoading(true);

    loader()
      .then((result) => {
        if (!active) {
          return;
        }

        setData(result);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setData(null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, deps);

  return { data, loading };
}
