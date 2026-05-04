import { Repository } from "typeorm";
import { RefreshToken } from "../entity/RefreshToken.js";
import { User } from "../entity/User.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config/index.js";

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {
        this.refreshTokenRepository = refreshTokenRepository;
    }
    generateRefreshToken(payload: JwtPayload): string {
        const refreshToken = jwt.sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
            jwtid: String(payload.id),
        });
        return refreshToken;
    }
    generateAccessToken(payload: JwtPayload): string {
        let privateKey: string;
        if (!Config.PRIVATE_KEY) {
            throw createHttpError(500, "Private key is not defined");
        }
        try {
            privateKey = Config.PRIVATE_KEY!;
        } catch {
            throw createHttpError(500, "Failed to read private key");
        }

        const accessToken = jwt.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });
        return accessToken;
    }

    async persistRefreshToken(user: User): Promise<RefreshToken> {
        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        });
        return newRefreshToken;
    }

    async deleteRefreshToken(tokenId: number): Promise<void> {
        const refreshToken = await this.refreshTokenRepository.delete(tokenId);
        if (!refreshToken) {
            throw createHttpError(404, "Refresh token not found");
        }
        return;
    }
}
