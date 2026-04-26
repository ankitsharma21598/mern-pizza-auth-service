import { DataSource } from "typeorm";

export const truncateTables = async (connection: DataSource) => {
    // const entities = connection.entityMetadatas.map(
    //     (entity: EntityMetadata) => entity.tableName,
    // );
    // for (const entity of entities) {
    //     const repository = connection.getRepository(entity);
    //     await repository.clear();
    // }

    const tableNames = connection.entityMetadatas
        .map((meta) => `"${meta.tableName}"`)
        .join(", ");
    if (!tableNames) return;
    await connection.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
};

export const isJwt = (token: string | null): boolean => {
    if (token === null) return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
        return true;
    } catch {
        return false;
    }
};
