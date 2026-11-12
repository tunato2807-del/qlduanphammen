import { Response } from "express";
import { User } from "@prisma/client";
import { Accounts, safeUser } from "../auth";
export async function signIn(accounts: Accounts, user: User, res: Response) {
  const token = await accounts.session(user);
  res.cookie("finora_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 86400000,
    path: "/",
  });
  return safeUser(user);
}
