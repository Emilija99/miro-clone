import { useMutation, useSelf } from "@/liveblocks.config";

export const useDeleteLayers = () => {
  const selection = useSelf((me) => me.presence.selection);

  return useMutation(
    ({ storage, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const liveLayersIds = storage.get("layerIds");

      for (const id of selection) {
        const index = liveLayersIds.indexOf(id);

        if (index !== -1) liveLayersIds.delete(index);
        liveLayers.delete(id);
      }

      setMyPresence({ selection: [] }, { addToHistory: true });
    },
    [selection]
  );
};
