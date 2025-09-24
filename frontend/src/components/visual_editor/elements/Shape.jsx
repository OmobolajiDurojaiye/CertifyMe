import React from "react";
import { Rect, Circle, Line } from "react-konva";

const Shape = ({ shapeProps, onSelect, onDragEnd, onTransformEnd }) => {
  const { shapeType, ...props } = shapeProps;

  const handleClick = (e) => {
    onSelect(e);
  };

  switch (shapeType) {
    case "rect":
      return (
        <Rect
          {...props}
          draggable
          onClick={handleClick}
          onTap={handleClick}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
        />
      );
    case "circle":
      return (
        <Circle
          x={props.width / 2}
          y={props.height / 2}
          radius={Math.min(props.width, props.height) / 2}
          fill={props.fill}
          stroke={props.stroke}
          strokeWidth={props.strokeWidth}
          draggable
          onClick={handleClick}
          onTap={handleClick}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
        />
      );
    case "line":
      return (
        <Line
          points={[0, props.height / 2, props.width, props.height / 2]}
          stroke={props.stroke}
          strokeWidth={props.strokeWidth}
          draggable
          onClick={handleClick}
          onTap={handleClick}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
        />
      );
    default:
      return null;
  }
};

export default Shape;
