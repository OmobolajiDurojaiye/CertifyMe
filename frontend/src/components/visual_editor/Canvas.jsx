// Canvas.jsx
import React, { useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Transformer,
  Group,
  Rect,
  Circle,
  Line,
} from "react-konva";
import useEditorStore from "../../store/editorStore";
import { ResizableImage, EditableText, Shape } from "./elements"; // Assume Shape is updated separately

const GRID_SIZE = 20;

const Canvas = () => {
  const {
    elements,
    background,
    canvas,
    selectedIds,
    setSelectedIds,
    updateElement,
    commitUpdate,
  } = useEditorStore();
  const stageRef = useRef();
  const transformerRef = useRef();
  const layerRef = useRef();

  useEffect(() => {
    if (transformerRef.current) {
      const selectedNodes = selectedIds
        .map((id) => stageRef.current.findOne("#" + id))
        .filter(Boolean);
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedIds]);

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedIds([]);
    }
  };

  const handleSelect = (e) => {
    e.cancelBubble = true;
    const clickedId = e.target.id();
    const el = elements.find((e) => e.id === clickedId);
    if (!el) return;

    const idToSelect = el.parentId || clickedId;
    const isSelected = selectedIds.includes(idToSelect);
    const isShiftPressed = e.evt.shiftKey;

    if (isShiftPressed) {
      if (isSelected) {
        setSelectedIds(selectedIds.filter((sid) => sid !== idToSelect));
      } else {
        setSelectedIds([...selectedIds, idToSelect]);
      }
    } else {
      if (!isSelected || selectedIds.length > 1) {
        setSelectedIds([idToSelect]);
      }
    }
  };

  const handleDragEnd = (e) => {
    const id = e.target.id();
    updateElement(id, {
      x: e.target.x(),
      y: e.target.y(),
    });
    commitUpdate();
  };

  const handleTransformEnd = (e) => {
    const node = e.target;
    const id = node.id();
    const el = elements.find((e) => e.id === id);

    if (el.type === "group") {
      updateElement(id, {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
      });
    } else {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      updateElement(id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      });
    }
    commitUpdate();
  };

  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i < canvas.width / GRID_SIZE; i++) {
      lines.push(
        <Rect
          key={`v${i}`}
          x={i * GRID_SIZE}
          y={0}
          width={1}
          height={canvas.height}
          fill="#f0f0f0"
          listening={false}
        />
      );
    }
    for (let j = 0; j < canvas.height / GRID_SIZE; j++) {
      lines.push(
        <Rect
          key={`h${j}`}
          x={0}
          y={j * GRID_SIZE}
          width={canvas.width}
          height={1}
          fill="#f0f0f0"
          listening={false}
        />
      );
    }
    return lines;
  };

  const renderElement = (el, isChild = false) => {
    const commonProps = {
      key: el.id,
      shapeProps: el,
      onSelect: handleSelect,
      onDragEnd: isChild ? null : handleDragEnd,
      onTransformEnd: isChild ? null : handleTransformEnd,
    };
    switch (el.type) {
      case "image":
        return <ResizableImage {...commonProps} />;
      case "text":
      case "placeholder":
        return <EditableText {...commonProps} />;
      case "shape":
        return <Shape {...commonProps} />;
      default:
        return null;
    }
  };

  const roots = elements.filter((el) => !el.parentId);

  return (
    <div
      className="flex-grow d-flex justify-content-center align-items-center p-4"
      style={{ background: "#F0F2F5" }}
    >
      <div
        className="bg-white"
        style={{
          boxShadow:
            "0px 8px 24px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08)",
          border: "1px solid #DFE2E6",
        }}
      >
        <Stage
          ref={stageRef}
          width={canvas.width}
          height={canvas.height}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            <Rect
              width={canvas.width}
              height={canvas.height}
              fill={background.fill || "#FFFFFF"}
              listening={false}
            />
            {renderGrid()}
          </Layer>
          <Layer ref={layerRef}>
            {roots.map((root) => {
              if (root.type === "group") {
                const children = elements.filter(
                  (el) => el.parentId === root.id
                );
                return (
                  <Group
                    key={root.id}
                    id={root.id}
                    x={root.x}
                    y={root.y}
                    rotation={root.rotation}
                    scaleX={root.scaleX}
                    scaleY={root.scaleY}
                    draggable
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                    onClick={handleSelect}
                    onTap={handleSelect}
                  >
                    {children.map((child) => renderElement(child, true))}
                  </Group>
                );
              } else {
                return renderElement(root);
              }
            })}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
              rotateEnabled={selectedIds.length === 1} // Disable rotate for multi
              resizeEnabled={selectedIds.length === 1 || selectedIds.length > 1} // Allow for multi
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;
