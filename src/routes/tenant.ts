import { NextFunction, Router, Response } from "express";
import { TenantController } from "../controllers/TenantController.js";
import { AppDataSource } from "../config/data-source.js";
import { Tenant } from "../entity/Tenant.js";
import { TenantService } from "../services/TenantService.js";
import { CreateTenantRequest } from "../types/index.js";
import logger from "../config/logger.js";
import authenticate from "../middlewares/authenticate.js";
import { canAccess } from "../middlewares/canAccess.js";
import { USER_ROLES } from "../constants/index.js";
const router = Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

router.post(
    "/",
    authenticate,
    canAccess([USER_ROLES.ADMIN]),
    (req: CreateTenantRequest, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next),
);

export default router;
