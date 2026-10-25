import 'dotenv/config';
import pg from 'pg';
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
try {
  await client.connect();
  await client.query('SELECT pg_advisory_lock(72843109)');
  await client.query('CREATE TABLE IF NOT EXISTS "_finora_migrations" (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  const directory=new URL('../prisma/migrations/',import.meta.url);
  const folders=(await readdir(directory,{withFileTypes:true})).filter(d=>d.isDirectory()).map(d=>d.name).sort();
  for(const folder of folders){
    const sql=await readFile(new URL(`${folder}/migration.sql`,directory),'utf8');
    const checksum=createHash('sha256').update(sql).digest('hex');
    const result=await client.query('SELECT checksum FROM "_finora_migrations" WHERE name=$1',[folder]);
    if(result.rows.length){if(result.rows[0].checksum!==checksum)throw new Error(`Migration ${folder} đã thay đổi sau khi áp dụng.`);console.log(`Đã có: ${folder}`);continue;}
    await client.query('BEGIN');
    try{await client.query(sql);await client.query('INSERT INTO "_finora_migrations" (name,checksum) VALUES ($1,$2)',[folder,checksum]);await client.query('COMMIT');console.log(`Đã áp dụng: ${folder}`);}
    catch(error){await client.query('ROLLBACK');throw error;}
  }
}catch(error){console.error('Migration thất bại:',error.message);process.exitCode=1;}
finally{await client.end();}
