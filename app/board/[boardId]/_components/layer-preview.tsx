"use client";

import { useStorage } from "@/liveblocks.config";
import { LayerVariant } from "@/types/layer";
import React, { memo } from "react";
import Rectangle from "./rectangle";
import Ellipse from "./ellipse";
import Text from "./text";
import Note from "./note";
import Path from "./path";
import { colorToCSS } from "@/lib/utils";

interface LayerPreviewProps {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
}

const LayerPreview = memo(
  ({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
    const layer = useStorage((root) => root.layers.get(id));

    if (!layer) return null;

    switch (layer.type) {
      case LayerVariant.Ellipse:
        return (
          <Ellipse
            id={id}
            layer={{ ...layer, type: LayerVariant.Ellipse }}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerVariant.Text:
        return (
          <Text
            id={id}
            layer={{ ...layer, type: LayerVariant.Text }}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerVariant.Note:
        return (
          <Note
            id={id}
            layer={{ ...layer, type: LayerVariant.Text }}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerVariant.Path:
        if (!layer.points) return;
        return (
          <Path
            key={id}
            points={layer.points}
            onPointerDown={(e) => onLayerPointerDown(e, id)}
            stroke={selectionColor}
            x={layer.x}
            y={layer.y}
            fill={layer.fill ? colorToCSS(layer.fill) : "#000"}
          />
        );
      case LayerVariant.Rectangle:
        return (
          <Rectangle
            id={id}
            layer={{ ...layer, type: LayerVariant.Rectangle }}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      default:
        console.warn("Unknown layer type");
    }
  }
);

LayerPreview.displayName = "LayerPreview";

export default LayerPreview;
