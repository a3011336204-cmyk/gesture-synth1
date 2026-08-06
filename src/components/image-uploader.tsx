'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageIcon, RefreshCw, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

export interface ImageUploaderValue {
  id: string;
  preview: string;
  url?: string;
  status: UploadStatus;
  size?: number;
}

interface ImageUploaderProps {
  allowMultiple?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
  title?: string;
  emptyHint?: string;
  className?: string;
  defaultPreviews?: string[];
  onChange?: (items: ImageUploaderValue[]) => void;
}

interface UploadItem extends ImageUploaderValue {
  file?: File;
  uploadKey?: string;
}

const formatBytes = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

const uploadImageFile = async (file: File) => {
  const formData = new FormData();
  formData.append('files', file);

  const response = await fetch('/api/storage/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 0 || !result.data?.urls?.length) {
    throw new Error(result.message || 'Upload failed');
  }

  return result.data.urls[0] as string;
};

export function ImageUploader({
  allowMultiple = false,
  maxImages = 1,
  maxSizeMB = 10,
  title,
  emptyHint,
  className,
  defaultPreviews,
  onChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isInitializedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const isInternalChangeRef = useRef(false);
  const replaceTargetIdRef = useRef<string | null>(null);
  const dragCounterRef = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);

  const [items, setItems] = useState<UploadItem[]>(() => {
    if (defaultPreviews?.length) {
      return defaultPreviews.map((url, index) => ({
        id: `preset-${url}-${index}`,
        preview: url,
        url,
        status: 'uploaded' as UploadStatus,
      }));
    }
    return [];
  });

  const maxCount = allowMultiple ? maxImages : 1;
  const maxBytes = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

    const defaultUrls = defaultPreviews || [];

    setItems((currentItems) => {
      const currentUrls = currentItems
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string);

      const isSame =
        defaultUrls.length === currentUrls.length &&
        defaultUrls.every((url, index) => url === currentUrls[index]);

      if (!isSame) {
        return defaultUrls.map((url, index) => ({
          id: `preset-${url}-${index}`,
          preview: url,
          url,
          status: 'uploaded' as UploadStatus,
        }));
      }

      return currentItems;
    });
  }, [defaultPreviews]);

  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [items]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    isInternalChangeRef.current = true;

    onChangeRef.current?.(
      items.map(({ id, preview, url, status, size }) => ({
        id,
        preview,
        url,
        status,
        size,
      }))
    );
  }, [items]);

  const replaceItems = (pairs: Array<{ id: string; file: File }>) => {
    pairs.forEach(({ id, file }) => {
      const uploadKey = `${Date.now()}-${Math.random()}`;
      const nextPreview = URL.createObjectURL(file);

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          if (item.preview.startsWith('blob:')) {
            URL.revokeObjectURL(item.preview);
          }
          return {
            ...item,
            preview: nextPreview,
            file,
            size: file.size,
            url: undefined,
            status: 'uploading' as UploadStatus,
            uploadKey,
          };
        })
      );

      uploadImageFile(file)
        .then((url) => {
          setItems((prev) =>
            prev.map((item) => {
              if (item.id !== id) return item;
              if (item.uploadKey !== uploadKey) return item;
              if (item.preview.startsWith('blob:')) {
                URL.revokeObjectURL(item.preview);
              }
              return {
                ...item,
                preview: url,
                url,
                status: 'uploaded' as UploadStatus,
                file: undefined,
              };
            })
          );
        })
        .catch((error: any) => {
          console.error('Upload failed:', error);
          toast.error(
            error?.message ? `Upload failed: ${error.message}` : 'Upload failed'
          );
          setItems((prev) =>
            prev.map((item) => {
              if (item.id !== id) return item;
              if (item.uploadKey !== uploadKey) return item;
              return { ...item, status: 'error' as UploadStatus };
            })
          );
        })
        .finally(() => {
          if (inputRef.current) inputRef.current.value = '';
        });
    });
  };

  const handleFiles = (selectedFiles: File[]) => {
    const replaceTargetId = replaceTargetIdRef.current;
    if (replaceTargetId) {
      replaceTargetIdRef.current = null;
      const file = selectedFiles[0];
      if (!file) return;
      if (!file.type?.startsWith('image/')) {
        toast.error('Only image files are supported');
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      if (file.size > maxBytes) {
        toast.error(`"${file.name}" exceeds the ${maxSizeMB}MB limit`);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      replaceItems([{ id: replaceTargetId, file }]);
      return;
    }

    const availableSlots = maxCount - items.length;
    const filesToAdd = selectedFiles
      .filter((file) => {
        if (!file.type?.startsWith('image/')) {
          toast.error(`"${file.name}" is not an image`);
          return false;
        }
        if (file.size > maxBytes) {
          toast.error(`"${file.name}" exceeds the ${maxSizeMB}MB limit`);
          return false;
        }
        return true;
      })
      .slice(0, Math.max(availableSlots, 0));

    if (!filesToAdd.length) {
      if (items.length) {
        const normalized = selectedFiles.filter((file) =>
          file.type?.startsWith('image/')
        );
        if (!normalized.length) return;

        const k = Math.min(normalized.length, items.length);
        const tail = items.slice(-k);
        const pairs: Array<{ id: string; file: File }> = [];

        for (let i = 0; i < k; i += 1) {
          const targetId = tail[tail.length - 1 - i]?.id;
          const file = normalized[i];
          if (targetId && file) pairs.push({ id: targetId, file });
        }

        if (pairs.length) replaceItems(pairs);
      }

      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (availableSlots < selectedFiles.length) {
      toast.message(
        `Only the first ${filesToAdd.length} image(s) will be added`
      );
    }

    const newItems = filesToAdd.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      preview: URL.createObjectURL(file),
      file,
      size: file.size,
      status: 'uploading' as UploadStatus,
      uploadKey: `${Date.now()}-${Math.random()}`,
    }));

    setItems((prev) => [...prev, ...newItems]);

    Promise.all(
      newItems.map(async (item) => {
        try {
          const url = await uploadImageFile(item.file as File);
          setItems((prev) =>
            prev.map((current) => {
              if (current.id !== item.id) return current;
              if (
                current.uploadKey &&
                item.uploadKey &&
                current.uploadKey !== item.uploadKey
              ) {
                return current;
              }
              if (current.preview.startsWith('blob:')) {
                URL.revokeObjectURL(current.preview);
              }
              return {
                ...current,
                preview: url,
                url,
                status: 'uploaded' as UploadStatus,
                file: undefined,
              };
            })
          );
        } catch (error: any) {
          console.error('Upload failed:', error);
          toast.error(
            error?.message ? `Upload failed: ${error.message}` : 'Upload failed'
          );
          setItems((prev) =>
            prev.map((current) => {
              if (current.id !== item.id) return current;
              if (current.uploadKey && current.uploadKey !== item.uploadKey)
                return current;
              return { ...current, status: 'error' as UploadStatus };
            })
          );
        }
      })
    );

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;
    handleFiles(selectedFiles);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardItems = Array.from(event.clipboardData?.items || []);
    const files = clipboardItems
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter(Boolean) as File[];

    if (!files.length) return;
    event.preventDefault();
    handleFiles(files);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);

    const files = Array.from(event.dataTransfer?.files || []).filter((file) =>
      file.type?.startsWith('image/')
    );
    if (!files.length) return;
    handleFiles(files);
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const removed = prev.find((item) => item.id === id);
      if (removed?.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const openReplacePicker = (id: string) => {
    replaceTargetIdRef.current = id;
    openFilePicker();
  };

  const countLabel = useMemo(
    () => `${items.length}/${maxCount}`,
    [items.length, maxCount]
  );

  return (
    <div
      className={cn(
        'relative rounded-[6px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b95c33]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf1] dark:focus-visible:ring-[#d87850]/35 dark:focus-visible:ring-offset-[#202b25]',
        isDragActive &&
          'ring-2 ring-[#b95c33]/45 ring-offset-2 ring-offset-[#fffaf1] dark:ring-[#d87850]/45 dark:ring-offset-[#202b25]',
        className
      )}
      tabIndex={0}
      onPaste={handlePaste}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-[6px] border border-[#b95c33] bg-[#f8f2e9]/90 backdrop-blur-sm dark:border-[#d87850] dark:bg-[#202b25]/90">
          <div className="rounded-[4px] border border-[#c6b299] bg-[#fffaf1] px-3 py-1.5 text-sm font-medium text-[#26352d] shadow-[0_2px_6px_rgba(57,48,36,0.12)] dark:border-[#526057] dark:bg-[#26322c] dark:text-[#f4eee4]">
            Drop to upload
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={allowMultiple}
        onChange={handleSelect}
        className="hidden"
      />

      {title && (
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#4f4034] dark:text-[#e7dcc9]">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#a14d2e] dark:text-[#d87850]" />
            <span>{title}</span>
            <span className="text-xs text-[#a14d2e] dark:text-[#d87850]">
              ({countLabel})
            </span>
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex flex-wrap gap-4',
          allowMultiple ? 'flex-wrap' : 'flex-nowrap'
        )}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-[6px] border border-[#c6b299] bg-[#f8f2e9] p-1 shadow-[0_1px_3px_rgba(57,48,36,0.08)] transition-[background-color,border-color,box-shadow] hover:border-[#a99176] hover:bg-[#efe4d5] hover:shadow-[0_2px_6px_rgba(57,48,36,0.12)] dark:border-[#46534b] dark:bg-[#26322c] dark:hover:border-[#617168] dark:hover:bg-[#2b3831] dark:hover:shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
          >
            <div className="relative overflow-hidden rounded-[4px]">
              <img
                src={item.preview}
                alt="Preview"
                className="h-32 w-32 rounded-[4px] object-cover"
              />
              {item.size && (
                <span className="absolute bottom-1.5 left-1.5 rounded-[3px] border border-[#c6b299] bg-[#fffaf1]/95 px-1.5 py-0.5 text-[10px] font-medium text-[#5e493b] shadow-[0_1px_2px_rgba(57,48,36,0.1)] dark:border-[#526057] dark:bg-[#202b25]/95 dark:text-[#d6cbbd]">
                  {formatBytes(item.size)}
                </span>
              )}
              {item.status !== 'uploading' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#26352d]/50 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 dark:bg-black/55">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="size-9 rounded-[5px] border border-[#fff7eb]/70 bg-[#fffaf1]/90 text-[#5e493b] shadow-[0_2px_5px_rgba(0,0,0,0.18)] backdrop-blur hover:bg-[#fffaf1] hover:text-[#26352d] focus-visible:border-[#fff7eb] focus-visible:ring-[#fff7eb]/45 dark:border-[#526057] dark:bg-[#26322c]/90 dark:text-[#f4eee4] dark:hover:bg-[#33433a]"
                    onClick={() => openReplacePicker(item.id)}
                    aria-label="Replace image"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
              )}
              {item.status === 'uploading' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#26352d]/80 text-xs font-medium text-[#fff7eb] dark:bg-black/70">
                  Uploading...
                </div>
              )}
              {item.status === 'error' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#98452d]/85 text-xs font-medium text-[#fff7eb] dark:bg-[#b85a3a]/85">
                  Failed
                </div>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1.5 right-1.5 z-20 size-7 rounded-[4px] border border-[#fff7eb]/60 bg-[#7d3520]/90 text-[#fff7eb] shadow-[0_1px_3px_rgba(0,0,0,0.18)] hover:bg-[#672816] focus-visible:border-[#fff7eb] focus-visible:ring-[#fff7eb]/45 dark:border-[#ffc6ad]/50 dark:bg-[#914128]/90 dark:text-[#fff7eb] dark:hover:bg-[#a94f31]"
                onClick={() => handleRemove(item.id)}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {items.length < maxCount && (
          <div className="group relative overflow-hidden rounded-[6px] border border-dashed border-[#bca98f] bg-[#f8f2e9] p-1 transition-[background-color,border-color] hover:border-[#a14d2e] hover:bg-[#efe4d5] dark:border-[#617168] dark:bg-[#26322c] dark:hover:border-[#d87850] dark:hover:bg-[#2b3831]">
            <div className="relative overflow-hidden rounded-[4px]">
              <button
                type="button"
                className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-[4px] text-[#5e493b] transition-colors hover:bg-[#e7dcc9] focus-visible:bg-[#e7dcc9] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#b95c33] dark:text-[#d6cbbd] dark:hover:bg-[#33433a] dark:focus-visible:bg-[#33433a] dark:focus-visible:outline-[#d87850]"
                onClick={openFilePicker}
              >
                <div className="flex size-9 items-center justify-center rounded-[4px] border border-dashed border-[#a99176] bg-[#fffaf1] text-[#a14d2e] dark:border-[#617168] dark:bg-[#202b25] dark:text-[#d87850]">
                  <Upload className="size-4" />
                </div>
                <span className="text-xs font-medium">Upload</span>
                <span className="text-xs text-[#a14d2e] dark:text-[#d87850]">
                  Max {maxSizeMB}MB
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {!title && emptyHint && (
        <div className="mt-2 text-xs leading-5 text-[#786b5b] dark:text-[#c8c1b5]">
          {emptyHint}
        </div>
      )}
    </div>
  );
}
