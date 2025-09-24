import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Text, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";
import { SERVER_BASE_URL } from "../config";

const KonvaElement = ({ element, dynamicData }) => {
  const [img] = useImage(
    element.src && element.src.startsWith("/uploads/")
      ? `${SERVER_BASE_URL}${element.src}`
      : element.src, // for base64 previews
    "anonymous"
  );

  const replacePlaceholders = (text) => {
    if (!text) return "";
    let newText = text;
    const placeholderMap = {
      "{{recipient_name}}": dynamicData.recipient_name,
      "{{course_title}}": dynamicData.course_title,
      "{{issue_date}}": dynamicData.issue_date,
      "{{issuer_name}}": dynamicData.issuer_name,
      "{{verification_id}}": dynamicData.verification_id,
      "{{signature}}": dynamicData.signature || dynamicData.issuer_name,
    };
    for (const [placeholder, value] of Object.entries(placeholderMap)) {
      newText = newText.replace(
        placeholder,
        value || `[${placeholder.slice(2, -2)}]`
      );
    }
    return newText;
  };

  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    listening: false,
  };

  switch (element.type) {
    case "text":
    case "placeholder":
      return (
        <Text
          {...commonProps}
          text={replacePlaceholders(element.text)}
          fontSize={element.fontSize}
          fontFamily={element.fontFamily}
          fill={element.fill}
          align={element.align}
          fontStyle={element.fontStyle}
          wrap="word"
        />
      );
    case "image":
      return <KonvaImage {...commonProps} image={img} />;
    case "shape":
      return (
        <Rect
          {...commonProps}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          cornerRadius={element.cornerRadius}
        />
      );
    default:
      return null;
  }
};

const KonvaPreview = ({ layoutData, dynamicData }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const {
    elements = [],
    background = {},
    canvas = { width: 842, height: 595 },
  } = layoutData || {};

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setScale(width / canvas.width);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvas.width]);

  const [bgImage] = useImage(
    background.image ? `${SERVER_BASE_URL}${background.image}` : "",
    "anonymous"
  );

  const backgroundStyle = {
    backgroundColor: background.fill || "transparent",
    backgroundImage: bgImage ? `url(${bgImage.src})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div
      ref={containerRef}
      className="w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        aspectRatio: `${canvas.width} / ${canvas.height}`,
        backgroundColor: "#e2e8f0",
      }}
    >
      <div
        className="position-relative"
        style={{ width: canvas.width * scale, height: canvas.height * scale }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={backgroundStyle}
        />
        <Stage
          width={canvas.width * scale}
          height={canvas.height * scale}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            {elements.map((el) => (
              <KonvaElement
                key={el.id}
                element={el}
                dynamicData={dynamicData}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default KonvaPreview;
