import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";
import { SERVER_BASE_URL } from "../config"; // ✅ make sure this points to your backend, e.g. http://127.0.0.1:5000

// 🖼️ Component for rendering background image
const BackgroundImage = ({ src, width, height }) => {
  const [image] = useImage(src, "anonymous");
  return image ? (
    <KonvaImage image={image} width={width} height={height} />
  ) : null;
};

const KonvaPreview = ({ layoutData, dynamicData, previewData }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // 🧩 Auto-scale to fit parent container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = width * 0.707; // maintain aspect ratio (A4 ratio)
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 🧠 Normalize data for all template types
  let normalized;
  if (previewData) {
    normalized = previewData;
  } else if (layoutData) {
    normalized = {
      type: "custom",
      templateData: {
        // ✅ Build full image path from backend
        backgroundImage: layoutData?.background?.image?.startsWith("http")
          ? layoutData.background.image
          : `${SERVER_BASE_URL}${layoutData.background.image}`,

        width: layoutData?.canvas?.width || 842,
        height: layoutData?.canvas?.height || 595,
        textElements: (layoutData?.elements || []).map((el) => {
          let text = el.text || "";
          if (dynamicData) {
            text = text
              .replace(
                /{{recipient_name}}/gi,
                dynamicData.recipient_name || "Recipient Name"
              )
              .replace(
                /{{issuer_name}}/gi,
                dynamicData.issuer_name || "Issuer Name"
              )
              .replace(/{{issue_date}}/gi, dynamicData.issue_date || "Date")
              .replace(/{{signature}}/gi, dynamicData.signature || "Signature")
              .replace(
                /{{course_title}}/gi,
                dynamicData.course_title || "Course Title"
              );
          }
          return { ...el, text };
        }),
      },
    };
  }

  if (!normalized) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100">
        <p className="text-gray-500">No preview available</p>
      </div>
    );
  }

  // 🧱 Custom (Visual) Template Preview
  if (normalized.type === "custom" && normalized.templateData) {
    const { templateData } = normalized;
    const scaleX = dimensions.width / (templateData.width || 842);
    const scaleY = dimensions.height / (templateData.height || 595);

    return (
      <div ref={containerRef} className="w-full">
        <Stage width={dimensions.width} height={dimensions.height}>
          <Layer>
            {/* 🖼️ Background image */}
            {templateData.backgroundImage && (
              <BackgroundImage
                src={templateData.backgroundImage}
                width={dimensions.width}
                height={dimensions.height}
              />
            )}

            {/* ✍️ Text elements (placeholders replaced with actual data) */}
            {(templateData.textElements || []).map((el, index) => (
              <Text
                key={index}
                x={el.x * scaleX}
                y={el.y * scaleY}
                text={el.text}
                fontSize={(el.fontSize || 20) * scaleX}
                fontFamily={el.fontFamily || "Arial"}
                fill={el.fill || "#000"}
                align={el.align || "left"}
                rotation={el.rotation || 0}
                width={el.width ? el.width * scaleX : undefined}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    );
  }

  // 🪄 Built-in Template Previews
  const data = normalized.data || {};

  // Modern layout
  if (normalized.type === "modern") {
    return (
      <div
        ref={containerRef}
        className="w-full bg-gray-900 text-white p-8"
        style={{ minHeight: dimensions.height }}
      >
        <div className="bg-gray-800 p-6 mb-6">
          <h1 className="text-4xl font-bold text-center">CERTIFICATE</h1>
          <p className="text-center text-gray-400 mt-2">OF ACHIEVEMENT</p>
        </div>
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-blue-400">
            {data.recipient_name || "Recipient Name"}
          </h2>
          <p className="text-lg">has successfully completed</p>
          <h3 className="text-2xl font-bold text-pink-400">
            {data.course_name || "Course Name"}
          </h3>
          <div className="mt-8 space-y-2">
            <p>Date: {data.issue_date || "Date"}</p>
            <p>Instructor: {data.instructor_name || "Instructor Name"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Classic layout
  if (normalized.type === "classic") {
    return (
      <div
        ref={containerRef}
        className="w-full bg-white p-8 border-8 border-double border-yellow-700"
        style={{ minHeight: dimensions.height }}
      >
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-serif text-yellow-800">Certificate</h1>
          <p className="text-xl text-yellow-700">of Achievement</p>
          <hr className="border-t-2 border-yellow-600 w-1/2 mx-auto" />
          <p className="text-lg mt-8">This is to certify that</p>
          <h2 className="text-3xl font-bold text-yellow-800">
            {data.recipient_name || "Recipient Name"}
          </h2>
          <p className="text-lg">has successfully completed</p>
          <h3 className="text-2xl font-bold text-yellow-800">
            {data.course_name || "Course Name"}
          </h3>
          <div className="mt-12 flex justify-between px-12">
            <div>
              <p className="border-t-2 border-yellow-700 pt-2">
                Date: {data.issue_date || "Date"}
              </p>
            </div>
            <div>
              <p className="border-t-2 border-yellow-700 pt-2">
                Instructor: {data.instructor_name || "Instructor"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex items-center justify-center h-96 bg-gray-100">
      <p className="text-gray-500">Unknown template type</p>
    </div>
  );
};

export default KonvaPreview;
