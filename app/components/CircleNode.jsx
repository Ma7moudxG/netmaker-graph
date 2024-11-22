/* eslint-disable react/display-name */
import React, { memo, useState } from "react";
import { Position } from "@xyflow/react";
import { Handle } from "react-flow-renderer";

export default memo(() => {
  // const label = useStore((s) => {
  //   const node = s.nodeLookup.get(id);

  //   if (!node) {
  //     return null;
  //   }

  //   return `Position x:${parseInt(node.position.x)} y:${parseInt(
  //     node.position.y
  //   )}`;
  // });

  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      className="circle-node"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>{'n'}</div>
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />

      {showTooltip && (
        <div
          style={{
            position: "absolute",
            top: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            border: "1px solid gray",
            padding: "5px",
            borderRadius: "5px",
            fontSize: "12px",
            whiteSpace: "nowrap",
          }}
        >
          {/* {data.label} */}
        </div>
      )}
    </div>
  );
});
