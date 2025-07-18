"use server";
import {
  getHonoHello,
  getHonoOgpById,
  getHonoPostById,
  getHonoRoot,
} from "./api-access";

export const fetchHonoRootAction = async () => {
  return await getHonoRoot();
};

export const fetchHonoHelloAction = async () => {
  return await getHonoHello();
};

export const getPost = async (id: string) => {
  return await getHonoPostById(id);
};

export const getOgp = async (id: string) => {
  return await getHonoOgpById(id);
};
