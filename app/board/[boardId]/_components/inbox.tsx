"use client";

import { useInboxNotifications } from "@/liveblocks.config";
import { ErrorBoundary } from "react-error-boundary";
import { InboxNotification, InboxNotificationList } from "@liveblocks/react-ui";
import * as Popover from "@radix-ui/react-popover";
import {
  useDeleteAllInboxNotifications,
  useMarkAllInboxNotificationsAsRead,
  useUnreadInboxNotificationsCount,
} from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";
import { ComponentPropsWithoutRef, useEffect, useState } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import Loading from "./loading";
import { toast } from "sonner";

function Inbox({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  const { inboxNotifications } = useInboxNotifications();

  useEffect(() => {
    if (inboxNotifications?.length) toast.success("you have new message");
  }, [inboxNotifications]);

  return inboxNotifications.length === 0 ? (
    <div className={clsx(className, "empty")}>
      There aren’t any notifications yet.
    </div>
  ) : (
    <div className={className} {...props}>
      <InboxNotificationList className="inbox-list">
        {inboxNotifications.map((inboxNotification) => {
          return (
            <InboxNotification
              key={inboxNotification.id}
              inboxNotification={inboxNotification}
            />
          );
        })}
      </InboxNotificationList>
    </div>
  );
}

function InboxPopoverUnreadCount() {
  const { count } = useUnreadInboxNotificationsCount();

  return count ? <div className="inbox-unread-count">{count}</div> : null;
}

export function InboxPopover({
  className,
  ...props
}: Popover.PopoverContentProps) {
  const [isOpen, setOpen] = useState(false);
  const markAllInboxNotificationsAsRead = useMarkAllInboxNotificationsAsRead();
  const deleteAllInboxNotifications = useDeleteAllInboxNotifications();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <Popover.Trigger className={clsx(className, "button square")}>
        <ErrorBoundary fallback={null}>
          <ClientSideSuspense fallback={null}>
            <InboxPopoverUnreadCount />
          </ClientSideSuspense>
        </ErrorBoundary>
        <svg
          width="30"
          height="30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path
            d="m3.6 9.8 1.9-4.6A2 2 0 0 1 7.3 4h5.4a2 2 0 0 1 1.8 1.2l2 4.6V13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V9.8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 10h3c.3 0 .6.1.8.4l.9 1.2c.2.3.5.4.8.4h2c.3 0 .6-.1.8-.4l.9-1.2c.2-.3.5-.4.8-.4h3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="inbox"
          collisionPadding={16}
          sideOffset={8}
          {...props}
        >
          <div className="inbox-header">
            <span className="inbox-title">Notifications</span>
            <div className="inbox-buttons">
              <button
                className="button"
                onClick={markAllInboxNotificationsAsRead}
              >
                Mark all as read
              </button>
              <button
                className="button destructive"
                onClick={deleteAllInboxNotifications}
              >
                Delete all
              </button>
            </div>
          </div>
          <ErrorBoundary
            fallback={
              <div className="error">
                There was an error while getting notifications.
              </div>
            }
          >
            <ClientSideSuspense fallback={<Loading />}>
              <Inbox />
            </ClientSideSuspense>
          </ErrorBoundary>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
