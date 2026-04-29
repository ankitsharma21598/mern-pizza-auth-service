import { expressjwt } from "express-jwt";
import { Config } from "../config/index.js";
import { Request } from "express";
import { RefreshToken } from "../entity/RefreshToken.js";
import { AppDataSource } from "../config/data-source.js";
import logger from "../config/logger.js";
import { AuthCookie, IRefreshTokenPayload } from "../types/index.js";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken: (req: Request) => {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    isRevoked: async (req: Request, token) => {
        console.log("token", token);
        try {
            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepository.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: { id: Number(token?.payload?.sub) },
                },
            });
            return refreshToken === null;
        } catch {
            logger.error("Error validating refresh token", {
                id: (token?.payload as IRefreshTokenPayload).id,
            });
            return true;
        }
    },
});
