import { expressjwt } from "express-jwt";
import { Config } from "../config/index.js";
import { Request } from "express";
import { AuthCookie } from "../types/index.js";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken: (req: Request) => {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
});
