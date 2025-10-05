// CustomTemplateEditor.jsx
import React, { useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Image,
  Text,
  Transformer,
  Group,
  Rect,
} from "react-konva";
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
        wrap="word"
        verticalAlign={shapeProps.verticalAlign || "top"}
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
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const DraggableQR = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const groupRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group
        onClick={onSelect}
        onTap={onSelect}
        ref={groupRef}
        x={shapeProps.x}
        y={shapeProps.y}
        rotation={shapeProps.rotation}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = groupRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, shapeProps.width * scaleX),
            height: Math.max(5, shapeProps.height * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        <Rect
          width={shapeProps.width}
          height={shapeProps.height}
          fill="lightgray"
          cornerRadius={5}
        />
        <Text
          text="QR Code"
          width={shapeProps.width}
          height={shapeProps.height}
          align="center"
          verticalAlign="middle"
          fontSize={14}
          fill="gray"
          listening={false}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
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
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target.getClassName() === "Image";
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
          {elements.map((el) =>
            el.isQr ? (
              <DraggableQR
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
            ) : (
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
            )
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default CustomTemplateEditor;
