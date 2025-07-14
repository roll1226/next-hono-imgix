"use server";
import { getHonoHello, getHonoRoot } from "./api-access";

export const fetchHonoRootAction = async () => {
  return await getHonoRoot();
};

export const fetchHonoHelloAction = async () => {
  return await getHonoHello();
};
