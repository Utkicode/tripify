const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        try {
            filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
        } catch (err) { }
    });
    return filelist;
};

const files = walkSync(path.join('c:', 'Users', 'Utkarsh', 'OneDrive', 'Documents', 'Tripify', 'tripify', 'src')).filter(f => f.endsWith('.jsx') || f.endsWith('.tsx'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Replace import of Loader -> SpinnerGap
    if (content.includes('Loader')) {
        content = content.replace(/\bLoader\b/g, 'SpinnerGap');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`Updated Loader in ${file}`);
    }
});
