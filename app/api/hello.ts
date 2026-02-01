import { NextApiRequest, NextApiResponse } from "next";

type Data = {
    name: string;
}
export function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    res.status(200).json({ name: 'Shawn Kim' })
}
