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

    if (content.includes('IndianRupee')) {
        content = content.replace(/\bIndianRupee\b/g, 'CurrencyInr');
        changed = true;
    }
    if (content.includes('DollarSign')) {
        content = content.replace(/\bDollarSign\b/g, 'CurrencyDollar');
        changed = true;
    }
    if (content.includes('Euro')) {
        content = content.replace(/\bEuro\b/g, 'CurrencyEur');
        changed = true;
    }
    if (content.includes('PoundSterling')) {
        content = content.replace(/\bPoundSterling\b/g, 'CurrencyGbp');
        changed = true;
    }
    if (content.includes('JapaneseYen')) {
        content = content.replace(/\bJapaneseYen\b/g, 'CurrencyJpy');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`Updated currencies in ${file}`);
    }
});
