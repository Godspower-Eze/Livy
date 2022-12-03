import type { NextApiRequest, NextApiResponse } from "next";
import Livepeer from "../../../lib/livepeer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;
  const livepeerInstance = new Livepeer();
  const axiosObject = livepeerInstance.axiosObject();
  const stream = await livepeerInstance.getStream(id, axiosObject);
  res.status(200).json(stream);
}
