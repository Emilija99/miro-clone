import { useThreads } from "@/liveblocks.config";
import { Thread } from "@liveblocks/react-ui";

function Component() {
  const { threads } = useThreads();

  return (
    <>
      {threads.map((thread) => (
        <Thread key={thread.id} thread={{ ...thread, resolved: false }} />
      ))}
    </>
  );
}
