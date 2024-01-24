"use client";

import { useSearchParams } from "next/navigation";

export default function Preview() {
  const searchParams = useSearchParams();

  const ip = searchParams.get("ip");

  return (
    <img
      src={`http://${ip}:5000/api/capture/thumbnail`}
      height={360}
      width={640}
      style={{
        display: "block",
      }}
    />
  );
}
