import React, { useRef, useEffect } from "react";
import { Text, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";
import { SERVER_BASE_URL } from "../../config";
import useEditorStore from "../../store/editorStore";

export const ResizableImage = ({
  shapeProps,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  const shapeRef = useRef();
  const transformerRef = useRef();
  const { selectedIds } = useEditorStore();
  const isSelected = selectedIds.includes(shapeProps.id);

  const [img] = useImage(
    shapeProps.src && shapeProps.src.startsWith("/uploads/")
      ? `${SERVER_BASE_URL}${shapeProps.src}`
      : shapeProps.src,
    "anonymous"
  );

  useEffect(() => {
    if (isSelected) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <KonvaImage
      ref={shapeRef}
      {...shapeProps}
      image={img}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
};

export const EditableText = ({
  shapeProps,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  return (
    <Text
      {...shapeProps}
      wrap="word" // Enable text wrapping
      ellipsis={false}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
};

export const Shape = ({ shapeProps, onSelect, onDragEnd, onTransformEnd }) => {
  return (
    <Rect
      {...shapeProps}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
};
