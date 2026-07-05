const { Client } = require('pg');
const fs = require('fs');

async function restore() {
    console.log('Reading backups...');
    const schemaDump = JSON.parse(fs.readFileSync('schema_dump.json', 'utf8'));
    const dataDump = JSON.parse(fs.readFileSync('full_database_backup.json', 'utf8'));

    // NEW DATABASE CREDENTIALS (provided by user)
    const newDbUrl = 'postgresql://postgres.sydbsvaoppoyrajphlhk:kSRGT0AYXHHpoP8d@aws-0-eu-west-3.pooler.supabase.com:6543/postgres';

    console.log('Connecting to NEW database...');
    const client = new Client({
        connectionString: newDbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. Enable UUID
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        // 2. Recreate Tables
        for (const [tableName, columns] of Object.entries(schemaDump)) {
            console.log(`Creating table "${tableName}"...`);
            let colDefs = [];
            for (const col of columns) {
                let type = col.data_type.toUpperCase();
                if (type === 'USER-DEFINED') type = 'TEXT'; // Convert Enums to TEXT to avoid errors
                if (type === 'ARRAY') type = 'TEXT[]';
                
                let def = `"${col.column_name}" ${type}`;
                
                // Keep it simple: no strict NOT NULL except id to prevent insert errors on slight mismatches
                if (col.column_name === 'id') {
                    def += ' PRIMARY KEY';
                    if (type === 'UUID') def += ' DEFAULT uuid_generate_v4()';
                }
                colDefs.push(def);
            }
            const createSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${colDefs.join(',\n  ')}\n);`;
            await client.query(createSql);
        }

        // 3. Insert Data
        for (const [tableName, rows] of Object.entries(dataDump.tables)) {
            if (rows.length === 0) {
                console.log(`Skipping "${tableName}" (0 rows)`);
                continue;
            }
            console.log(`Restoring ${rows.length} rows into "${tableName}"...`);
            
            const columns = Object.keys(rows[0]);
            
            // Chunk inserts (max 100 rows per query)
            const chunkSize = 100;
            for (let i = 0; i < rows.length; i += chunkSize) {
                const chunk = rows.slice(i, i + chunkSize);
                
                let valuesSql = [];
                let params = [];
                let paramIndex = 1;
                
                for (const row of chunk) {
                    let rowParams = [];
                    for (const col of columns) {
                        params.push(row[col]);
                        rowParams.push(`$${paramIndex++}`);
                    }
                    valuesSql.push(`(${rowParams.join(', ')})`);
                }
                
                const insertSql = `
                    INSERT INTO "${tableName}" ("${columns.join('", "')}")
                    VALUES ${valuesSql.join(', ')}
                    ON CONFLICT DO NOTHING;
                `;
                await client.query(insertSql, params);
            }
        }

        console.log('✅ Restore complete! Your new database is ready.');

    } catch (err) {
        console.error('Restore failed:', err);
    } finally {
        await client.end();
    }
}

restore();
