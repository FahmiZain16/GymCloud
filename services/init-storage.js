const fs = require('fs').promises;
const path = require('path');

async function provisionBranchStorage(branchId) {
    console.log(`Starting storage provisioning for Branch ID: ${branchId}...`);
    
    const basePath = __dirname; 
    const branchFolder = `storage/branch_${branchId}`;
    const fullPath = path.join(basePath, branchFolder);
    
    const subFolders = ['profiles', 'documents', 'reports'];
    
    try {
        await fs.mkdir(fullPath, { recursive: true });
        
        for (const sub of subFolders) {
            await fs.mkdir(path.join(fullPath, sub), { recursive: true });
        }
        
        console.log(`[STORAGE] Provisioning success. Workspace ready: /${branchFolder}`);
        return true;
    } catch (error) {
        console.error(`[STORAGE] Failed to provision workspace for branch ${branchId}:`, error.message);
        return false;
    }
}

module.exports = provisionBranchStorage;

