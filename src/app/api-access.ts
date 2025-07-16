import { client } from "@/lib/hono";

export const getHonoRoot = async () => {
  const res = await client.api.home.$get();
  return res.text();
};

export const getHonoHello = async () => {
  const res = await client.api.hello.$get();
  return res.json();
};

export const getHonoPostById = async (id: string) => {
  const res = await client.api.posts[":id"].$get({ param: { id } });
  if (!res.ok) {
    return null;
  }
  return res.json();
};

export const getHonoOgpById = async (id: string) => {
  const res = await client.api.posts.ogp[":id"].$get({ param: { id } });
  if (!res.ok) {
    return null;
  }
  return res.json();
};
