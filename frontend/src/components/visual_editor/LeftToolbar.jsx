// components/visual_editor/LeftToolbar.jsx
import React from "react";
import { Square, Image as ImageIcon, Type, Braces } from "lucide-react";

const LeftToolbar = ({ activePanel, setActivePanel }) => {
  const tools = [
    { id: "elements", icon: <Square size={24} />, label: "Elements" },
    { id: "images", icon: <ImageIcon size={24} />, label: "Images" },
    { id: "text", icon: <Type size={24} />, label: "Text" },
    { id: "attributes", icon: <Braces size={24} />, label: "Dynamic" },
  ];

  return (
    <>
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`left-toolbar-button ${
            activePanel === tool.id ? "active" : ""
          }`}
          onClick={() =>
            setActivePanel(activePanel === tool.id ? null : tool.id)
          }
        >
          {tool.icon}
          <span>{tool.label}</span>
        </button>
      ))}
    </>
  );
};

export default LeftToolbar;
