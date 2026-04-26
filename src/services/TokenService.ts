import { Repository } from "typeorm";
import { RefreshToken } from "../entity/RefreshToken.js";
import { User } from "../entity/User.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import path from "path";
import fs from "fs";
import createHttpError from "http-errors";
import { Config } from "../config/index.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        let privateKey: Buffer;
        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private.pem"),
            );
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
}
