import React from "react";
import { NoteLayer } from "@/types/layer";
import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import {
  calculateFontSize,
  cn,
  colorToCSS,
  getContrastingTextColor,
} from "@/lib/utils";
import { useMutation } from "@/liveblocks.config";

const font = Kalam({ subsets: ["latin"], weight: ["400"] });

interface NoteProps {
  id: string;
  layer: NoteLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const Note = ({ id, layer, onPointerDown, selectionColor }: NoteProps) => {
  const { x, y, width, height, fill, value } = layer;

  const updateValue = useMutation(({ storage }, newValue: string) => {
    const liveLayers = storage.get("layers");

    liveLayers.get(id)?.set("value", newValue);
  }, []);

  const handleContentChange = (e: ContentEditableEvent) => {
    updateValue(e.target.value);
  };

  return (
    <foreignObject
      onPointerDown={(e) => onPointerDown(e, id)}
      x={x}
      y={y}
      width={width}
      height={height}
      style={{
        outline: selectionColor ? `1px solid ${selectionColor}` : "none",
        backgroundColor: fill ? colorToCSS(fill) : "#000",
      }}
      className="shadow-md drop-shadow-xl"
    >
      <ContentEditable
        html={value || ""}
        onChange={handleContentChange}
        className={cn(
          "w-full h-full flex items-center justify-center text-center outline-none",
          font.className
        )}
        style={{
          color: fill ? getContrastingTextColor(fill) : "#000",
          fontSize: calculateFontSize(width, height, 0.15),
        }}
      />
    </foreignObject>
  );
};

export default Note;
