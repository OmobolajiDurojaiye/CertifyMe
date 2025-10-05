import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";
import { SERVER_BASE_URL } from "../config";

// Component for rendering background image
const BackgroundImage = ({ src, width, height }) => {
  const [image] = useImage(src, "anonymous");
  return image ? (
    <KonvaImage image={image} width={width} height={height} />
  ) : null;
};

const KonvaPreview = ({ layoutData, dynamicData }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 566 });

  // Auto-scale to fit parent container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Maintain a standard A4-like aspect ratio (landscape)
        const height = width / 1.414;
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // If there's no layout data, we can't render anything.
  if (!layoutData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-gray-500">No visual template data available.</p>
      </div>
    );
  }

  // Define canvas base dimensions from layout data or use defaults
  const baseWidth = layoutData?.canvas?.width || 842;
  const baseHeight = layoutData?.canvas?.height || 595;

  // Calculate scaling factors
  const scaleX = dimensions.width / baseWidth;
  const scaleY = dimensions.height / baseHeight;

  // Construct the full background image URL
  const backgroundImageSrc = layoutData?.background?.image
    ? layoutData.background.image.startsWith("http")
      ? layoutData.background.image
      : `${SERVER_BASE_URL}${layoutData.background.image}`
    : null;

  // Process text elements and replace placeholders with dynamic data
  const textElements = (layoutData?.elements || []).map((el) => {
    let text = el.text || "";
    if (dynamicData) {
      // Use fallback text if dynamicData fields are empty
      const recipientName = dynamicData.recipient_name || "Recipient Name";
      const issuerName = dynamicData.issuer_name || "Issuer Name";
      const issueDate = dynamicData.issue_date
        ? new Date(dynamicData.issue_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Issue Date";
      const signature = dynamicData.signature || issuerName; // Fallback signature to issuer name
      const courseTitle = dynamicData.course_title || "Course Title";

      text = text
        .replace(/{{recipient_name}}/gi, recipientName)
        .replace(/{{issuer_name}}/gi, issuerName)
        .replace(/{{issue_date}}/gi, issueDate)
        .replace(/{{signature}}/gi, signature)
        .replace(/{{course_title}}/gi, courseTitle);
    }
    return { ...el, text };
  });

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          {/* Background image */}
          {backgroundImageSrc && (
            <BackgroundImage
              src={backgroundImageSrc}
              width={dimensions.width}
              height={dimensions.height}
            />
          )}

          {/* Text elements */}
          {textElements.map((el, index) => (
            <Text
              key={index}
              x={el.x * scaleX}
              y={el.y * scaleY}
              text={el.text}
              fontSize={(el.fontSize || 20) * Math.min(scaleX, scaleY)} // Scale font more uniformly
              fontFamily={el.fontFamily || "Arial"}
              fill={el.fill || "#000"}
              align={el.align || "left"}
              rotation={el.rotation || 0}
              width={el.width ? el.width * scaleX : undefined}
              draggable={false} // Ensure text is not draggable in preview
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaPreview;
