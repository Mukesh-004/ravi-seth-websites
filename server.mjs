import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createBackend} from './src/backend.mjs';
const host=process.env.HOST||'127.0.0.1';
const port=Number(process.env.PORT||4173);
const dataDir=resolve(process.env.DATA_DIR||resolve(import.meta.dirname,'data'));
if((host!=='127.0.0.1'&&host!=='localhost'||process.env.NODE_ENV==='production')&&!process.env.ADMIN_TOKEN)throw Error('Set ADMIN_TOKEN before exposing the server.');
await mkdir(dataDir,{recursive:true});
createBackend({dbPath:resolve(dataDir,'site.sqlite')}).server.listen(port,host,()=>console.log(`Website server: http://${host}:${port}`));
