// CustomTemplateEditor.jsx
import React, { useRef, useEffect } from "react";
import { Stage, Layer, Image, Text, Transformer } from "react-konva";
import useImage from "use-image";

const DraggableText = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={["middle-left", "middle-right"]}
        />
      )}
    </>
  );
};

const CustomTemplateEditor = ({
  stageRef,
  backgroundImageUrl,
  elements,
  setElements,
  selectedId,
  setSelectedId,
  canvasSize,
}) => {
  const [image] = useImage(backgroundImageUrl, "anonymous");
  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  return (
    <div
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      }}
    >
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          <Image
            image={image}
            width={canvasSize.width}
            height={canvasSize.height}
          />
          {elements.map((el) => (
            <DraggableText
              key={el.id}
              shapeProps={el}
              isSelected={el.id === selectedId}
              onSelect={() => {
                setSelectedId(el.id);
              }}
              onChange={(newAttrs) => {
                const updatedElements = elements.map((elem) => {
                  if (elem.id === el.id) {
                    return { ...elem, ...newAttrs };
                  }
                  return elem;
                });
                setElements(updatedElements);
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default CustomTemplateEditor;
