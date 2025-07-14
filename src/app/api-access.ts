import { client } from "@/lib/hono";

export const getHonoRoot = async () => {
  const res = await client.api.home.$get();
  return res.text();
};

export const getHonoHello = async () => {
  const res = await client.api.hello.$get();
  return res.json();
};
