"use client";

import { nanoid } from "nanoid";
import React, { useCallback, useMemo, useState } from "react";
import Info from "./info";
import Participants from "./participants";
import Toolbar from "./toolbar";
import { CanvasMode, CanvasState } from "@/types/canvas";
import {
  useHistory,
  useCanRedo,
  useCanUndo,
  useMutation,
  useStorage,
  useOthersMapped,
  useSelf,
} from "@/liveblocks.config";
import CursorsPresence from "./cursors-presence";
import { Camera } from "@/types/camera";
import {
  colorToCSS,
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";
import { Color } from "@/types/color";
import { LayerVariant } from "@/types/layer";
import { Point } from "@/types/point";
import { LiveObject } from "@liveblocks/client";
import LayerPreview from "./layer-preview";
import SelectionBox from "./selection_box";
import { Side } from "@/types/side";
import { Box } from "@/types/box";
import SelectionTools from "./selection-tools";
import Path from "./path";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import CommentComposer from "./comment-composer";

const MAX_LAYERS = 100;

interface CanvasProps {
  boardId: string;
}

const Canvas = ({ boardId }: CanvasProps) => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 255,
    g: 255,
    b: 255,
  });

  const layerIds = useStorage((root) => root.layerIds);
  const selections = useOthersMapped((other) => other.presence.selection);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);

  useDisableScrollBounce();

  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: Box) => {
      history.pause();
      setCanvasState({ mode: CanvasMode.Resizing, corner, initialBounds });
    },
    [history]
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({ x: camera.x - e.deltaX, y: camera.y - e.deltaY }));
  }, []);

  const insertLayer = useMutation(
    (
      { setMyPresence, storage },
      layerType:
        | LayerVariant.Ellipse
        | LayerVariant.Note
        | LayerVariant.Rectangle
        | LayerVariant.Text,
      position: Point
    ) => {
      const liveLayers = storage.get("layers");
      if (MAX_LAYERS <= liveLayers?.size) return;

      const liveLayersIds = storage.get("layerIds");
      const layerId = nanoid();
      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      });

      liveLayersIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
    },
    [lastUsedColor]
  );

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return;

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liverLayers = storage.get("layers");

      for (const id of self.presence.selection) {
        const layer = liverLayers.get(id);

        layer &&
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
      }

      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },

    [canvasState]
  );

  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0)
      setMyPresence({ selection: [] }, { addToHistory: true });
  }, []);

  const startMultiselection = useCallback((current: Point, origin: Point) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5)
      setCanvasState({ mode: CanvasMode.SelectionNet, origin, current });
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const layers = storage.get("layers").toImmutable();

      setCanvasState({ mode: CanvasMode.SelectionNet, origin, current });

      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        origin,
        current
      );

      setMyPresence({ selection: ids });
    },
    [layerIds]
  );

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      )
        return;

      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft?.length === 1 &&
          pencilDraft[0][0] === point.x &&
          pencilDraft[0][1] === point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode]
  );

  const insertPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const { pencilDraft } = self.presence;

      if (
        pencilDraft == null ||
        pencilDraft?.length < 2 ||
        liveLayers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null });
        return;
      }

      const id = nanoid();
      liveLayers.set(
        id,
        new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
      );

      const liveLayersIds = storage.get("layerIds");
      liveLayersIds.push(id);

      setMyPresence({ pencilDraft: null });
      setCanvasState({ mode: CanvasMode.Pencil });
    },
    [lastUsedColor]
  );

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor]
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) return;

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(self.presence.selection[0]);

      if (layer) layer.update({ ...bounds, width: bounds.w, height: bounds.h });
    },
    [canvasState]
  );

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();

      const current = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.Pressing)
        startMultiselection(current, canvasState.origin);
      else if (canvasState.mode === CanvasMode.SelectionNet)
        updateSelectionNet(current, canvasState.origin);
      else if (canvasState.mode === CanvasMode.Translating)
        translateSelectedLayers(current);
      else if (canvasState.mode === CanvasMode.Resizing)
        resizeSelectedLayer(current);
      else if (canvasState.mode === CanvasMode.Pencil)
        continueDrawing(current, e);

      setMyPresence({ cursor: current });
    },
    [
      canvasState,
      resizeSelectedLayer,
      camera,
      resizeSelectedLayer,
      translateSelectedLayers,
      startMultiselection,
      updateSelectionNet,
      continueDrawing,
    ]
  );

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) return;

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setCanvasState({ mode: CanvasMode.Pressing, origin: point });
    },
    [camera, canvasState.mode, setCanvasState, startDrawing]
  );

  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera);
      if (
        canvasState.mode === CanvasMode.Pressing ||
        canvasState.mode == CanvasMode.None
      ) {
        unselectLayers();
        setCanvasState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Pencil) insertPath();
      else if (canvasState.mode === CanvasMode.Inserting)
        insertLayer(canvasState.layerType, point);
      else setCanvasState({ mode: CanvasMode.None });

      history.resume();
    },
    [
      camera,
      canvasState,
      history,
      insertLayer,
      unselectLayers,
      insertPath,
      setCanvasState,
    ]
  );

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      )
        return;

      history.pause();
      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);

      if (!self.presence.selection.includes(layerId))
        setMyPresence({ selection: [layerId] }, { addToHistory: true });

      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode]
  );

  const layerIdsToSelectionColor = useMemo(() => {
    const layerIdsToSelectionColor: Record<string, string> = {};

    for (const user of selections) {
      const [connectionId, selection] = user;

      for (const layerId of selection) {
        layerIdsToSelectionColor[layerId] = connectionIdToColor(connectionId);
      }
    }
    return layerIdsToSelectionColor;
  }, [selections]);

  return (
    <main className="w-full h-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo}
        redo={history.redo}
      />
      <CommentComposer />
      <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
      <svg
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerUp={onPointerUp}
        onPointerDown={onPointerDown}
      >
        <g style={{ transform: `translate(${camera.x}px,${camera.y}px)` }}>
          {layerIds?.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToSelectionColor[layerId]}
            />
          ))}
          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
          {canvasState.mode === CanvasMode.SelectionNet &&
            !!canvasState.current && (
              <rect
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                y={Math.min(canvasState.origin.y, canvasState.current.y)}
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
              />
            )}
          <CursorsPresence />
          {pencilDraft != null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCSS(lastUsedColor)}
              x={0}
              y={0}
            />
          )}
        </g>
      </svg>
    </main>
  );
};

export default Canvas;
