import { TenantService } from "../services/TenantService.js";
import { NextFunction, Response } from "express";
import { CreateTenantRequest } from "../types/index.js";
import { Logger } from "winston";

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {
        this.tenantService = tenantService;
    }
    async create(
        req: CreateTenantRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const { name, address } = req.body;
        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info("Tenant created:", { id: tenant.id });
            res.status(201).json({ id: tenant.id });
        } catch (error) {
            next(error);
        }
    }
}
