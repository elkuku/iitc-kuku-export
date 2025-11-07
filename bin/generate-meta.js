import fs from 'fs'
import path from 'path'

const baseUrl = 'http://localhost:8100' // 👈 Change this if needed
const dir = process.cwd()+'/dist'

console.log(dir)

function parseMeta(fileContent) {
    const meta = {}
    const regex = /\/\/\s*@(\S+)\s+(.+)/g
    let match
    while ((match = regex.exec(fileContent))) {
        meta[match[1]] = match[2]
    }
    return meta
}

const plugins = fs.readdirSync(dir)
    .filter(f => f.endsWith('.user.js'))
    .map(filename => {
        const content = fs.readFileSync(path.join(dir, filename), 'utf8')
        const meta = parseMeta(content)
        return {
            id: meta.id || filename.replace('.user.js', ''),
            name: meta.name || filename,
            version: meta.version || '0.0.1',
            category: meta.category || 'Misc',
            filename,
            description: meta.description || '',
            downloadURL: `${baseUrl}/${filename}`
        }
    })

fs.writeFileSync(
    path.join(dir, 'meta.json'),
    JSON.stringify({ plugins }, null, 2)
)

console.log(`✅ meta.json generated with ${plugins.length} plugins.`)
