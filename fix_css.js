
const fs = require('fs');
const path = 'project.css';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Replacement 1
    const search1 = 'background-color: black !important;';
    const replace1 = 'background-color: rgba(0, 0, 0, 0.6) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px;';

    // Replacement 2
    const search2 = 'background: black !important;';
    const replace2 = 'background: rgba(0, 0, 0, 0.6) !important;';

    // Check if targets exist
    if (!content.includes(search1)) console.log('Target 1 not found');
    if (!content.includes(search2)) console.log('Target 2 not found');

    content = content.split(search1).join(replace1);
    content = content.split(search2).join(replace2);

    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully updated project.css');
} catch (err) {
    console.error('Error:', err);
}
