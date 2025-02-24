"use client";

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useMutation, useSelf } from "@/liveblocks.config";
import { Camera } from "@/types/camera";
import { Color } from "@/types/color";
import React, { memo } from "react";
import ColorPicker from "./color-picker";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import Hint from "@/components/hint";
import { Button } from "@/components/ui/button";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";

interface SelectionToolsProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void;
}

const SelectionTools = memo(
  ({ camera, setLastUsedColor }: SelectionToolsProps) => {
    const selection = useSelf((me) => me.presence.selection);

    const selectionBounds = useSelectionBounds();

    const deleteLayers = useDeleteLayers();

    const moveToFront = useMutation(
      ({ storage }) => {
        const liveLayersIds = storage.get("layerIds");

        const indices: number[] = [];

        const arr = liveLayersIds.toArray();

        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) indices.push(i);
        }

        for (let i = 0; i < indices.length; i++)
          liveLayersIds.move(indices[i], liveLayersIds.length - 1 - i);
      },
      [selection]
    );

    const moveToBack = useMutation(
      ({ storage }) => {
        const liveLayersIds = storage.get("layerIds");

        const indices: number[] = [];

        const arr = liveLayersIds.toArray();

        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) indices.push(i);
        }

        for (let i = 0; i < indices.length; i++)
          liveLayersIds.move(indices[i], i);
      },
      [selection]
    );

    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        const liverLayers = storage.get("layers");
        setLastUsedColor(fill);

        selection.forEach((id) => liverLayers?.get(id)?.set("fill", fill));
      },
      [selection, setLastUsedColor]
    );

    if (!selectionBounds) return;

    const x = selectionBounds.x + selectionBounds.w / 2 + camera.x;
    const y = selectionBounds.y + camera.y;

    return (
      <div
        className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
        style={{
          transform: `translate(calc(${x}px - 50%),calc(${y - 16}px - 100%))`,
        }}
      >
        <ColorPicker onChange={setFill} />
        <div className="flex flex-col gap=y=0.5">
          <Hint label="Bring to front">
            <Button variant="board" size="icon" onClick={moveToFront}>
              <BringToFront />
            </Button>
          </Hint>
          <Hint label="Send to back" side="bottom">
            <Button variant="board" size="icon" onClick={moveToBack}>
              <SendToBack />
            </Button>
          </Hint>
        </div>
        <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
          <Hint label="Delete">
            <Button variant="board" size="icon" onClick={deleteLayers}>
              <Trash2 />
            </Button>
          </Hint>
        </div>
      </div>
    );
  }
);

SelectionTools.displayName = "SelectionTools";

export default SelectionTools;
