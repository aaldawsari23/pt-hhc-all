import { useEffect, useRef, useState } from 'react';

interface AutosaveOptions {
  delay?: number; // milliseconds
  onSave: (data: any) => Promise<void>;
}

export function useAutosave<T>(data: T, options: AutosaveOptions) {
  const { delay = 600, onSave } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);

  useEffect(() => {
    // Don't autosave if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setError(null);
        await onSave(data);
        setLastSaved(new Date());
        previousDataRef.current = data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ');
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, onSave]);

  return {
    isSaving,
    lastSaved,
    error,
  };
}