import { Avatar, Box, Modal } from "@mui/material";
import React, { useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: "50%",
  maxHeight: "95%",
  bgcolor: "rgba(0,0,0,0.8)",
  boxShadow: 24,
  outline: "none",
  borderRadius: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const ScreenshotPreview = ({ value }) => {
  const [open, setOpen] = useState(false);
  const imageUrl = value ? `${value}` : null;

  return (
    <>
      <Avatar
        alt="screenshot"
        src={imageUrl}
        sx={{ cursor: "pointer", width: 48, height: 48 }}
        onClick={() => setOpen(true)}
      />

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={style}>
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit
            doubleClick={{ disabled: false }}
          >
            <TransformComponent>
              <img
                src={imageUrl}
                alt="screenshot-preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  borderRadius: 8,
                  cursor: "grab",
                  userSelect: "none",
                }}
              />
            </TransformComponent>
          </TransformWrapper>
        </Box>
      </Modal>
    </>
  );
};

export default ScreenshotPreview;
