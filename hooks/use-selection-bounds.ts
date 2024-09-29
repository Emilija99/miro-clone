import { useSelf, useStorage } from "@/liveblocks.config";
import { Box } from "@/types/box";
import { Layer } from "@/types/layer";
import { shallow } from "@liveblocks/client";

const getBoundingBox = (layers: Layer[]): Box | null => {
  const first = layers[0];

  if (!first) return null;

  let left = first.x;
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  for (let i = 1; i < layers.length; i++) {
    const { x, y, width, height } = layers[i];

    if (left > x) left = x;
    if (right < x + width) right = x + width;
    if (y < top) top = y;
    if (bottom < y + height) bottom = y + height;
  }

  return {
    x: left,
    y: top,
    w: right - left,
    h: bottom - top,
  };
};

export const useSelectionBounds = () => {
  const selection = useSelf((me) => me.presence.selection);

  return useStorage((root) => {
    const selectedLayers = selection
      .map((layerId) => root.layers.get(layerId)!)
      .filter(Boolean);
    return getBoundingBox(selectedLayers);
  }, shallow);
};
