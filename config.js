import dotenv from 'dotenv';

dotenv.config();

const config = {
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 9042,
	user: process.env.DB_USERNAME || 'cassandra',
	password: process.env.DB_PASSWORD || 'cassandra',
	localDataCenter: process.env.DB_LOCAL_DATACENTER,
	keyspace: process.env.DB_KEYSPACE,
};

export { config };
