import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const text = "API test OK!";
  const query = req.query;

  const result = {
    text,
    hint:"You can test it by sending a query, for example: http://192.168.0.16:3000/api/test?test=ok",
    query,
  };
  res.status(200).json(result);
}
