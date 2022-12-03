import type { NextApiRequest, NextApiResponse } from "next";
import Livepeer from "../../../lib/livepeer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const livepeerInstance = new Livepeer();
  const axiosObject = livepeerInstance.axiosObject();
  const streams = await livepeerInstance.getStreams(axiosObject);
  res.status(200).json(streams);
}
