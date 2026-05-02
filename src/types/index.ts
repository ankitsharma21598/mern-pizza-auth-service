import type { Request } from "express";
export interface UserData {
    name: string;
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface LoginUserData {
    email: string;
    password: string;
}

export interface AuthRequest extends Request {
    auth: {
        sub: number;
        role: string;
        id?: string;
    };
}

export interface IRefreshTokenPayload {
    id: string;
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface ITenant {
    name: string;
    address: string;
}

export interface CreateTenantRequest extends Request {
    body: ITenant;
}
