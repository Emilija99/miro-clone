import { useThreads } from "@liveblocks/react/suspense";
import { Composer, Thread } from "@liveblocks/react-ui";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowBigDownDash,
  ArrowsUpFromLine,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  ListCollapse,
  MessageCircle,
  MessageCircleMore,
  XIcon,
} from "lucide-react";

// A custom composer that creates a thread on submit
function CommentComposer() {
  const { threads } = useThreads();
  const thread = threads?.[0];
  const numOfCommnets = thread?.comments?.length;

  const [contentOpen, setContentOpen] = useState(false);

  return (
    <div className="absolute top-20 right-2 flex flex-col gap-y-4 items-end">
      <Button
        onClick={() => setContentOpen((prev) => !prev)}
        variant="outline"
        className="w-fit flex items-center gap-x-1 py-6 shadow-md text-slate-700"
      >
        <MessageCircleMore className="text-blue-600" />
        {!thread ? "" : `(${numOfCommnets})`}
        {!contentOpen ? <ChevronDown /> : <ChevronUp />}
      </Button>
      {contentOpen && (
        <div className=" flex flex-col gap-y-4  overflow-auto shadow-md w-[20vw] rounded-md  bg-white relative">
          <div className="flex justify-between items-center pl-4 border-b-slate-200 border-b-[1px]   text-slate-700">
            Conversation
            <Button
              className="w-fit self-end p-0 px-2 font-sm text-[12px]"
              variant="ghost"
              onClick={() => setContentOpen(false)}
            >
              <XIcon />
            </Button>
          </div>
          {thread ? (
            <Thread
              key={thread.id}
              thread={{ ...thread, comments: [...thread.comments].reverse() }}
            />
          ) : (
            <Composer />
          )}
        </div>
      )}
    </div>
  );
}

export default CommentComposer;
