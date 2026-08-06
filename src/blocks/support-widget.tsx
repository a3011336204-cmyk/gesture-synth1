import { useState } from 'react';
import { LifeBuoy, X } from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { apiPost } from '@/lib/api-client';
import { currentPathWithQuery } from '@/lib/redirect';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { ImageUploader } from '@/components/image-uploader';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * Floating support button (bottom-right) that opens a quick ticket form.
 * Drop into any page or layout: <SupportWidget />
 *
 * Requires login — unauthenticated users get a sign-in prompt instead.
 */
export function SupportWidget() {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!title.trim() || !content.trim()) {
      toast.error(m['common.support.required']());
      return;
    }
    setSubmitting(true);
    try {
      await apiPost('/api/tickets', { title, content, attachments });
      toast.success(m['common.support.success']());
      setOpen(false);
      setTitle('');
      setContent('');
      setAttachments([]);
      setUploaderKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        aria-label={m['common.support.open_label']()}
        onClick={() => setOpen(true)}
        className={cn(
          'fixed right-5 bottom-5 z-50 flex size-11 items-center justify-center rounded-full border border-[#8e4228] bg-[#b95c33] text-[#fff7eb] shadow-[0_5px_14px_rgba(100,54,36,0.24)]',
          'transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#a64e2e] hover:shadow-[0_7px_18px_rgba(100,54,36,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b95c33] active:translate-y-0',
          'dark:border-[#e58d68] dark:bg-[#c86a43] dark:text-[#1d2a24] dark:shadow-[0_5px_14px_rgba(0,0,0,0.3)] dark:hover:bg-[#d87850] dark:focus-visible:outline-[#d87850]'
        )}
      >
        {open ? <X className="size-5" /> : <LifeBuoy className="size-5" />}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-5 rounded-[8px] border border-[#c6b299] bg-[#fffaf1] p-5 text-[#26352d] shadow-[0_16px_38px_rgba(57,48,36,0.2)] ring-0 dark:border-[#46534b] dark:bg-[#202b25] dark:text-[#f4eee4] dark:shadow-[0_16px_38px_rgba(0,0,0,0.36)]">
          <DialogHeader className="gap-2 pr-8">
            <DialogTitle className="font-serif text-lg leading-tight font-semibold text-[#26352d] dark:text-[#f4eee4]">
              {m['common.support.title']()}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#786b5b] dark:text-[#c8c1b5]">
              {m['common.support.description']()}
            </DialogDescription>
          </DialogHeader>

          {!isPending && !session?.user ? (
            <div className="flex flex-col items-center gap-4 border-y border-[#d8cab6] py-6 text-center dark:border-[#3d4942]">
              <p className="text-sm leading-6 text-[#786b5b] dark:text-[#c8c1b5]">
                {m['common.support.sign_in_notice']()}
              </p>
              <Link
                href={`/sign-in?callbackUrl=${encodeURIComponent(currentPathWithQuery('/'))}`}
                className={cn(
                  buttonVariants(),
                  'rounded-[6px] border border-[#8e4228] bg-[#b95c33] px-3 text-[#fff7eb] shadow-[0_1px_2px_rgba(57,48,36,0.12)] hover:bg-[#a64e2e] focus-visible:border-[#b95c33] focus-visible:ring-[#b95c33]/25 dark:border-[#e58d68] dark:bg-[#c86a43] dark:text-[#1d2a24] dark:hover:bg-[#d87850] dark:focus-visible:border-[#d87850] dark:focus-visible:ring-[#d87850]/25'
                )}
              >
                {m['common.support.sign_in']()}
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <div className="space-y-4 py-1">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="support-title"
                    className="text-sm font-semibold text-[#4f4034] dark:text-[#e7dcc9]"
                  >
                    {m['common.support.title_label']()}
                  </Label>
                  <Input
                    id="support-title"
                    value={title}
                    maxLength={200}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={m['common.support.title_placeholder']()}
                    className="h-9 rounded-[6px] border-[#c6b299] bg-[#fffdf7] text-[#26352d] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] placeholder:text-[#827564] hover:border-[#a99176] focus-visible:border-[#b95c33] focus-visible:ring-[#b95c33]/25 disabled:bg-[#eee4d7] dark:border-[#46534b] dark:bg-[#18211d] dark:text-[#f4eee4] dark:placeholder:text-[#a9a59a] dark:hover:border-[#617168] dark:focus-visible:border-[#d87850] dark:focus-visible:ring-[#d87850]/25 dark:disabled:bg-[#26322c]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="support-content"
                    className="text-sm font-semibold text-[#4f4034] dark:text-[#e7dcc9]"
                  >
                    {m['common.support.content_label']()}
                  </Label>
                  <Textarea
                    id="support-content"
                    value={content}
                    maxLength={5000}
                    rows={5}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={m['common.support.content_placeholder']()}
                    className="min-h-28 rounded-[6px] border-[#c6b299] bg-[#fffdf7] text-[#26352d] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] placeholder:text-[#827564] hover:border-[#a99176] focus-visible:border-[#b95c33] focus-visible:ring-[#b95c33]/25 disabled:bg-[#eee4d7] dark:border-[#46534b] dark:bg-[#18211d] dark:text-[#f4eee4] dark:placeholder:text-[#a9a59a] dark:hover:border-[#617168] dark:focus-visible:border-[#d87850] dark:focus-visible:ring-[#d87850]/25 dark:disabled:bg-[#26322c]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-[#4f4034] dark:text-[#e7dcc9]">
                    {m['common.support.attachments_label']()}
                  </Label>
                  <ImageUploader
                    key={uploaderKey}
                    allowMultiple
                    maxImages={9}
                    onChange={(items) => {
                      setAttachments(
                        items
                          .filter((i) => i.status === 'uploaded' && i.url)
                          .map((i) => i.url!)
                      );
                      setUploading(items.some((i) => i.status === 'uploading'));
                    }}
                  />
                </div>
                <p className="text-xs leading-5 text-[#786b5b] dark:text-[#c8c1b5]">
                  {m['common.support.track_hint_prefix']()}{' '}
                  <Link
                    href="/settings/tickets"
                    className="font-medium text-[#914128] underline decoration-[#c88162] underline-offset-3 hover:text-[#6f2e1d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b95c33] dark:text-[#e58d68] dark:decoration-[#8c543f] dark:hover:text-[#ffc6ad] dark:focus-visible:outline-[#d87850]"
                  >
                    {m['common.support.track_hint_link']()}
                  </Link>
                </p>
              </div>
              <DialogFooter className="-mx-5 -mb-5 rounded-b-[8px] border-[#c6b299] bg-[#efe4d5] px-5 py-4 dark:border-[#46534b] dark:bg-[#26322c]">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-[6px] border-[#bca98f] bg-[#fffaf1] text-[#5e493b] hover:border-[#a99176] hover:bg-[#e7dcc9] hover:text-[#26352d] focus-visible:border-[#b95c33] focus-visible:ring-[#b95c33]/25 dark:border-[#526057] dark:bg-[#202b25] dark:text-[#d6cbbd] dark:hover:border-[#617168] dark:hover:bg-[#33433a] dark:hover:text-[#fff7eb] dark:focus-visible:border-[#d87850] dark:focus-visible:ring-[#d87850]/25"
                  onClick={() => setOpen(false)}
                >
                  {m['common.support.cancel']()}
                </Button>
                <Button
                  type="submit"
                  className="rounded-[6px] border border-[#8e4228] bg-[#b95c33] text-[#fff7eb] shadow-[0_1px_2px_rgba(57,48,36,0.12)] hover:bg-[#a64e2e] focus-visible:border-[#b95c33] focus-visible:ring-[#b95c33]/25 disabled:border-[#c6a38f] disabled:bg-[#d7b6a5] disabled:text-[#fff7eb]/80 dark:border-[#e58d68] dark:bg-[#c86a43] dark:text-[#1d2a24] dark:hover:bg-[#d87850] dark:focus-visible:border-[#d87850] dark:focus-visible:ring-[#d87850]/25 dark:disabled:border-[#725247] dark:disabled:bg-[#6f4b3d] dark:disabled:text-[#d8c3b8]"
                  disabled={submitting || uploading}
                >
                  {submitting
                    ? m['common.support.submitting']()
                    : m['common.support.submit']()}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
