import type { NextApiRequest, NextApiResponse } from "next";
import Livepeer from "../../../lib/livepeer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const name = req.body.name;
  const livepeerInstance = new Livepeer();
  const axiosObject = livepeerInstance.axiosObject();
  const streamData = await livepeerInstance.startStream(name, axiosObject);
  res.status(201).json(streamData);
}
