// components/visual_editor/ElementsPanel.jsx
import React from "react";
import { Square, Circle } from "lucide-react";
import useEditorStore from "../../store/editorStore";

const ElementsPanel = () => {
  const { addElement } = useEditorStore();

  return (
    <>
      <h6>Shapes</h6>
      <div className="asset-grid">
        <div
          className="asset-item"
          onClick={() =>
            addElement("shape", {
              shapeType: "rect",
              width: 100,
              height: 100,
              fill: "#cccccc",
              stroke: null,
              strokeWidth: 0,
            })
          }
        >
          <Square fill="#cccccc" />
        </div>
        <div
          className="asset-item"
          onClick={() =>
            addElement("shape", {
              shapeType: "rect",
              width: 100,
              height: 100,
              fill: "transparent",
              stroke: "#000000",
              strokeWidth: 1,
            })
          }
        >
          <Square stroke="#000000" fill="transparent" />
        </div>
        <div
          className="asset-item"
          onClick={() =>
            addElement("shape", {
              shapeType: "circle",
              width: 100,
              height: 100,
              fill: "#cccccc",
              stroke: null,
              strokeWidth: 0,
            })
          }
        >
          <Circle fill="#cccccc" />
        </div>
        <div
          className="asset-item"
          onClick={() =>
            addElement("shape", {
              shapeType: "circle",
              width: 100,
              height: 100,
              fill: "transparent",
              stroke: "#000000",
              strokeWidth: 1,
            })
          }
        >
          <Circle stroke="#000000" fill="transparent" />
        </div>
        <div
          className="asset-item"
          onClick={() =>
            addElement("shape", {
              shapeType: "line",
              width: 200,
              height: 2,
              stroke: "#000000",
              strokeWidth: 2,
              fill: null,
            })
          }
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            <line
              x1="4"
              y1="16"
              x2="28"
              y2="16"
              stroke="#000"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default ElementsPanel;
