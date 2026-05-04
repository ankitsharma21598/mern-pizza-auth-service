import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant.js";
import { ITenant } from "../types/index.js";
import createHttpError from "http-errors";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {
        this.tenantRepository = tenantRepository;
    }
    async create({ name, address }: ITenant): Promise<Tenant> {
        try {
            return await this.tenantRepository.save({ name, address });
        } catch {
            const error = createHttpError(500, "Failed to create tenant");
            throw error;
        }
    }
}
