import { DataSource, EntityMetadata } from "typeorm";

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas.map(
        (entity: EntityMetadata) => entity.tableName,
    );
    for (const entity of entities) {
        const repository = connection.getRepository(entity);
        await repository.clear();
    }
};
