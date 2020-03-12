import "reflect-metadata";
import { createConnection, Connection, ObjectType, Repository, EntitySchema, ConnectionOptions } from "typeorm";
import { v1 as uuidv1 } from 'uuid';
import { tLogger } from 'tag-tree-logger';
import { tDatabaseConfig } from "../types";

export default async function connectdb(config: tDatabaseConfig, name?: string): Promise<Connection> {
    if (!name) {
        name = uuidv1();
    }

    let ConnectionOption: ConnectionOptions

    if (config.url) {
        ConnectionOption = {
            name: name,
            url: config.url,
            type: "mysql",
            entities: [__dirname + "/entity/*{.js,.ts}"],
            migrations: [__dirname + "/migration/*{.js,.ts}"],
            migrationsRun: true,
            // cache: true,
            //entityPrefix: "test_",
            synchronize: false,
            entityPrefix: config.prefix,
            logging: config.logging
        }
    } else {
        ConnectionOption = {
            name: name,
            type: "mysql",
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            database: config.database,
            entities: [__dirname + "/entity/*{.js,.ts}"],
            migrations: [__dirname + "/migration/*{.js,.ts}"],
            migrationsRun: true,
            // cache: true,
            //entityPrefix: "test_",
            synchronize: false,
            entityPrefix: config.prefix,
            logging: config.logging
        }
    }

    return await createConnection(ConnectionOption)
}

export class typeormdb {
    readonly logger: tLogger
    readonly pConnection: Promise<Connection>
    private resolveGetConnection: ((value?: Connection | PromiseLike<Connection> | undefined) => void) | null = null
    constructor(readonly parentLogger: tLogger, readonly config: tDatabaseConfig) {
        this.logger = parentLogger.logger(["typeormdb"])
        this.pConnection = new Promise((resolve) => {
            this.resolveGetConnection = resolve
        })        //connectdb(config);
    }
    async startup() {
        let conn = await connectdb(this.config);
        if (this.resolveGetConnection === null) {
            this.logger.fault("db init error")
            throw new Error("db init error")
        }
        this.resolveGetConnection(conn)
    }
    readonly getConnection = async (): Promise<Connection> => {
        return await this.pConnection
    }
    /**
     * safe to pass directly
     */
    readonly getRepository = async <Entity>(repo: ObjectType<Entity> | EntitySchema<Entity> | string): Promise<Repository<Entity>> => {
        let connection = await this.pConnection
        return await connection.getRepository(repo)
    }
    /**
     * safe to pass directly
     */
    readonly inited = (): Promise<Connection> => {
        return this.pConnection
    }
}