"use client";

import LoadingButton from "@mui/lab/LoadingButton";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Link from "next/link";
import { useEffect, useState } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#22c55e",
    },
  },
});

export default function Home() {
  const ipAddresses = [
    "localhost",
    "192.168.0.2",
    "192.168.0.3",
    "192.168.0.4",
    "192.168.0.5",
  ];
  const heights = ["2500", "1400", "900", "600", "300"];
  const [isRecording, setIsRecording] = useState(
    new Array(ipAddresses.length).fill(false)
  );
  const [isUploading, setIsUploading] = useState(
    new Array(ipAddresses.length).fill(false)
  );
  const [thumbnails, setThumbnails] = useState(
    new Array(ipAddresses.length).fill(undefined)
  );

  useEffect(() => {
    const intervalID = setInterval(() => {
      const now = new Date().getTime();

      setThumbnails(
        ipAddresses.map(
          (ip) => `http://${ip}:5000/api/capture/thumbnail?timestamp=${now}`
        )
      );
    }, 5000);
    return () => {
      clearInterval(intervalID);
    };
  }, []);

  const startRecording = (ip: string) => {
    fetch(`http://${ip}:5000/api/capture/start`);
  };

  const stopRecording = (ip: string) => {
    fetch(`http://${ip}:5000/api/capture/stop`);
  };

  const handleRecord = (index: number) => {
    setIsRecording((prevIsRecording) =>
      prevIsRecording.map((element, i) => {
        if (i === index) {
          if (!element) {
            startRecording(ipAddresses[index]);
          } else {
            stopRecording(ipAddresses[index]);
          }
          return !element;
        } else {
          return element;
        }
      })
    );
  };

  const handleUpload = (index: number) => {
    setIsUploading((prevIsUploading) =>
      prevIsUploading.map((element, i) => (i === index ? true : element))
    );

    fetch(
      `http://${ipAddresses[index]}:5000/api/upload?height=${heights[index]}`
    ).finally(() => {
      setIsUploading((prevIsUploading) =>
        prevIsUploading.map((element, i) => (i === index ? false : element))
      );
    });
  };

  return (
    <ThemeProvider theme={theme}>
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
                <Link href={{ pathname: "/preview", query: { ip: ip } }}>
                  <img
                    src={thumbnails[index]}
                    height={72}
                    width={128}
                    style={{
                      display: "block",
                    }}
                  />
                </Link>
                <Typography
                  variant="subtitle1"
                  sx={{
                    paddingLeft: 1.5,
                  }}
                >
                  {ip}
                </Typography>
                <Switch
                  checked={isRecording[index]}
                  disabled={isUploading[index]}
                  onChange={() => handleRecord(index)}
                  sx={{
                    position: "absolute",
                    right: 119.6 - 8,
                  }}
                />
                <LoadingButton
                  onClick={() => handleUpload(index)}
                  loading={isUploading[index]}
                  variant="outlined"
                  disabled={isRecording[index]}
                  sx={{
                    position: "absolute",
                    right: 16,
                  }}
                >
                  <span>Upload</span>
                </LoadingButton>
              </ListItem>
            );
          })}
        </List>
      </Stack>
    </ThemeProvider>
  );
}
