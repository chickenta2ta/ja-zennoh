"use client";

import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { alpha, styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

const GreenSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#22c55e",
    "&:hover": {
      backgroundColor: alpha("#22c55e", theme.palette.action.hoverOpacity),
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#22c55e",
  },
}));

export default function Home() {
  const ipAddresses = [
    "localhost",
    "192.168.0.2",
    // "192.168.0.3",
    // "192.168.0.4",
    // "192.168.0.5",
  ];
  const [isRecording, setIsRecording] = useState(
    new Array(ipAddresses.length).fill(false)
  );
  const [thumbnails, setThumbnails] = useState(
    new Array(ipAddresses.length).fill(undefined)
  );

  const captureFrame = () => {
    const now = dayjs().format("YYYYMMDD_HHmmss_SSS");

    ipAddresses.forEach((ip, index) => {
      if (isRecording[index]) {
        fetch(`http://${ip}:5000/api/capture?timestamp=${now}`);
      }
    });
  };

  const ref = useRef(captureFrame);
  useEffect(() => {
    ref.current = captureFrame;
  }, [captureFrame]);

  useEffect(() => {
    const captureIntervalID = setInterval(() => {
      ref.current();
    }, 200);
    const thumbnailIntervalID = setInterval(() => {
      setThumbnails(
        ipAddresses.map((ip) => `http://${ip}:8080/?action=snapshot`)
      );
    }, 5000);
    return () => {
      clearInterval(captureIntervalID);
      clearInterval(thumbnailIntervalID);
    };
  }, []);

  const handleChange = (index: number) => {
    setIsRecording((prevIsRecording) =>
      prevIsRecording.map((element, i) => (i === index ? !element : element))
    );
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        bgcolor: "#f3f4f6",
        height: "100vh",
        width: "100%",
      }}
    >
      <List
        sx={{
          bgcolor: "white",
          width: "50%",
        }}
      >
        {ipAddresses.map((ip, index) => {
          return (
            <ListItem key={ip}>
              <Chip
                label="REC"
                size="small"
                sx={{
                  bgcolor: "#ef4444",
                  color: "white",
                  width: 62.5,
                  marginRight: 2,
                  fontWeight: "medium",
                  visibility: isRecording[index] ? "visible" : "hidden",
                }}
              />
              <a href={`http://${ip}:8080/?action=stream`}>
                <img
                  src={thumbnails[index]}
                  height={72}
                  width={128}
                  style={{
                    display: "block",
                  }}
                />
              </a>
              <Typography
                variant="subtitle1"
                sx={{
                  paddingLeft: 1.5,
                }}
              >
                {ip}
              </Typography>
              <GreenSwitch
                checked={isRecording[index]}
                onChange={() => handleChange(index)}
                sx={{
                  position: "absolute",
                  right: 8,
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}
