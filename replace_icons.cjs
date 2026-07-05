const fs = require('fs');
const path = require('path');

const iconMapping = {
    // Nav & Layout
    'LayoutDashboard': 'SquaresFour',
    'Map': 'MapTrifold',
    'Settings': 'Gear',
    'LogOut': 'SignOut',
    'ChevronLeft': 'CaretLeft',
    'ChevronRight': 'CaretRight',
    'ChevronDown': 'CaretDown',
    'ChevronUp': 'CaretUp',
    'PieChart': 'ChartPie',
    'Info': 'Info',
    'Lightbulb': 'Lightbulb',
    'Menu': 'List',
    'X': 'X',
    'Bell': 'Bell',
    // Features & Dashboard
    'Receipt': 'Receipt',
    'Users': 'Users',
    'User': 'User',
    'UserPlus': 'UserPlus',
    'UserMinus': 'UserMinus',
    'BarChart2': 'ChartBar',
    'BarChart': 'ChartBar',
    'FileDown': 'FileArrowDown',
    'Smartphone': 'DeviceMobile',
    'Wifi': 'WifiHigh',
    'TrendingUp': 'TrendUp',
    'TrendingDown': 'TrendDown',
    'ArrowRight': 'ArrowRight',
    'ArrowLeft': 'ArrowLeft',
    'Plus': 'Plus',
    'Minus': 'Minus',
    'Check': 'Check',
    'CheckCircle2': 'CheckCircle',
    'CheckCircle': 'CheckCircle',
    'AlertCircle': 'WarningCircle',
    'AlertTriangle': 'Warning',
    'CreditCard': 'CreditCard',
    'DollarSign': 'CurrencyDollar',
    'Home': 'House',
    'Calendar': 'Calendar',
    'Clock': 'Clock',
    'MapPin': 'MapPin',
    'Plane': 'Airplane',
    'Car': 'Car',
    'Train': 'Train',
    'Coffee': 'Coffee',
    'Utensils': 'ForkKnife',
    'ShoppingBag': 'ShoppingBag',
    'Bed': 'Bed',
    'Ticket': 'Ticket',
    'Camera': 'Camera',
    'Share2': 'ShareNetwork',
    'Download': 'Download',
    'Upload': 'Upload',
    'Trash2': 'Trash',
    'Edit2': 'PencilSimple',
    'Edit': 'Pencil',
    'MoreVertical': 'DotsThreeVertical',
    'MoreHorizontal': 'DotsThree',
    'Search': 'MagnifyingGlass',
    'Filter': 'Faders',
    'Mail': 'EnvelopeSimple',
    'Lock': 'LockKey',
    'Eye': 'Eye',
    'EyeOff': 'EyeSlash',
    'LogIn': 'SignIn',
    'Activity': 'Activity',
    'Globe': 'Globe',
    'Shield': 'Shield',
    'MessageSquare': 'Chat',
    'Send': 'PaperPlaneRight',
    'FileText': 'FileText',
    'Image': 'Image',
    'Link': 'Link',
    'ExternalLink': 'ArrowSquareOut',
    'Copy': 'Copy',
    'Twitter': 'TwitterLogo',
    'Facebook': 'FacebookLogo',
    'Instagram': 'InstagramLogo',
    'Linkedin': 'LinkedinLogo',
    'Github': 'GithubLogo',
    'Key': 'Key',
    'Circle': 'Circle',
    'PlusCircle': 'PlusCircle',
    'MinusCircle': 'MinusCircle',
    'XCircle': 'XCircle',
    'HelpCircle': 'Question',
    'RefreshCw': 'ArrowsClockwise',
    'Loader2': 'SpinnerGap',
    'CalendarDays': 'CalendarBlank',
    'Bus': 'Bus',
    'Ship': 'Boat',
    'Navigation': 'NavigationArrow',
    'Compass': 'Compass',
    'Briefcase': 'Briefcase',
    'Star': 'Star',
    'Heart': 'Heart',
    'ThumbsUp': 'ThumbsUp',
    'ThumbsDown': 'ThumbsDown',
    'Smile': 'Smiley',
    'Frown': 'SmileySad',
    'Meh': 'SmileyMeh',
    'Sun': 'Sun',
    'Moon': 'Moon',
    'Cloud': 'Cloud',
    'CloudRain': 'CloudRain',
    'CloudSnow': 'CloudSnow',
    'CloudLightning': 'CloudLightning',
    'Wind': 'Wind',
    'Droplet': 'Drop',
    'Zap': 'Lightning',
    'Battery': 'BatteryFull',
    'BatteryCharging': 'BatteryCharging',
    'Monitor': 'Monitor',
    'Laptop': 'Laptop',
    'Watch': 'Watch',
    'Headphones': 'Headphones',
    'Speaker': 'SpeakerHigh',
    'Volume2': 'SpeakerHigh',
    'VolumeX': 'SpeakerSlash',
    'Mic': 'Microphone',
    'MicOff': 'MicrophoneSlash',
    'Video': 'VideoCamera',
    'VideoOff': 'VideoCameraSlash',
    'CameraOff': 'CameraSlash',
    'Unlock': 'LockKeyOpen',
    'ArrowUp': 'ArrowUp',
    'ArrowDown': 'ArrowDown',
    'ChevronsLeft': 'CaretsLeft',
    'ChevronsRight': 'CaretsRight',
    'ChevronsUp': 'CaretsUp',
    'ChevronsDown': 'CaretsDown',
    'Maximize': 'CornersOut',
    'Minimize': 'CornersIn',
    'Maximize2': 'ArrowsOut',
    'Minimize2': 'ArrowsIn',
    'Move': 'ArrowsOutCardinal',
    'ZoomIn': 'MagnifyingGlassPlus',
    'ZoomOut': 'MagnifyingGlassMinus',
    'List': 'ListDashes',
    'Grid': 'SquaresFour',
    'AlignLeft': 'TextAlignLeft',
    'AlignCenter': 'TextAlignCenter',
    'AlignRight': 'TextAlignRight',
    'AlignJustify': 'TextAlignJustify',
    'Bold': 'TextB',
    'Italic': 'TextItalic',
    'Underline': 'TextUnderline',
    'Strikethrough': 'TextStrikethrough',
    'Type': 'TextT',
    'Paperclip': 'Paperclip',
    'Tag': 'Tag',
    'Folder': 'Folder',
    'FolderPlus': 'FolderPlus',
    'FolderMinus': 'FolderMinus',
    'Inbox': 'Tray',
    'Archive': 'Archive',
    'Save': 'FloppyDisk',
    'Award': 'Medal',
    'Gift': 'Gift',
    'Music': 'MusicNotes',
    'Play': 'Play',
    'Pause': 'Pause',
    'StopCircle': 'StopCircle',
    'SkipBack': 'SkipBack',
    'SkipForward': 'SkipForward',
    'FastForward': 'FastForward',
    'Rewind': 'Rewind',
    'Shuffle': 'Shuffle',
    'Repeat': 'Repeat',
    'Hash': 'Hash',
    'AtSign': 'At',
    'Command': 'Command',
    'Terminal': 'TerminalWindow',
    'Code': 'Code',
    'GitBranch': 'GitBranch',
    'GitCommit': 'GitCommit',
    'GitMerge': 'GitMerge',
    'GitPullRequest': 'GitPullRequest',
    'Database': 'Database',
    'Server': 'HardDrives',
    'HardDrive': 'HardDrive',
    'Cpu': 'Cpu',
    'Wallet': 'Wallet',
    'Landmark': 'Bank',
    'Banknote': 'Money',
    'Coins': 'Coins',
    'PiggyBank': 'PiggyBank',
    'Percent': 'Percent',
    'CircleDollarSign': 'CurrencyDollar',
    'ShieldCheck': 'ShieldCheck',
    'ShieldAlert': 'ShieldWarning',
    'TriangleAlert': 'Warning',
    'Pin': 'PushPin',
    'Wand2': 'MagicWand',
    'Sparkles': 'Sparkle',
    'Layout': 'Layout',
    'Columns': 'Columns',
    'Sidebar': 'SidebarSimple',
    'PanelLeft': 'SidebarSimple',
    'PanelRight': 'SidebarSimple',
    'PanelTop': 'SidebarSimple',
    'PanelBottom': 'SidebarSimple',
    'Table': 'Table',
    'ListTodo': 'ListChecks',
    'Calculator': 'Calculator',
    'Book': 'Book',
    'BookOpen': 'BookOpen',
    'Bookmark': 'BookmarkSimple',
    'Printer': 'Printer',
    'Scan': 'Scan',
    'QrCode': 'QrCode',
    'Barcode': 'Barcode',
    'PenTool': 'PenNib',
    'Scissors': 'Scissors',
    'Crop': 'Crop',
    'Pen': 'Pen',
    'PaintBucket': 'PaintBucket',
    'Crosshair': 'Crosshair',
    'Target': 'Target',
    'Focus': 'CornersOut',
    'Badge': 'Badge',
    'BadgeCheck': 'Badge',
    'BadgeAlert': 'Badge',
    'BadgeInfo': 'Badge',
    'Flag': 'Flag',
    'BellOff': 'BellSlash',
    'BellRing': 'BellRinging',
    'Megaphone': 'Megaphone',
    'Radio': 'Radio',
    'Cast': 'Screencast',
    'Tv': 'Television',
    'MonitorPlay': 'MonitorPlay',
    'MonitorSpeaker': 'Monitor',
    'Tablet': 'DeviceTablet',
    'Phone': 'Phone',
    'PhoneCall': 'PhoneCall',
    'PhoneIncoming': 'PhoneIncoming',
    'PhoneOutgoing': 'PhoneOutgoing',
    'PhoneMissed': 'PhoneMissed',
    'PhoneOff': 'PhoneSlash',
    'MailOpen': 'EnvelopeOpen',
    'MessageCircle': 'ChatCircle',
    'UserCheck': 'UserCheck',
    'UserX': 'UserMinus',
    'File': 'File',
    'FilePlus': 'FilePlus',
    'FileMinus': 'FileMinus',
    'FileSearch': 'FileSearch',
    'Clipboard': 'Clipboard',
    'ClipboardList': 'ClipboardText',
    'ClipboardCheck': 'ClipboardText',
    'ClipboardCopy': 'ClipboardText',
    'ClipboardPaste': 'ClipboardText',
    'Link2': 'Link',
    'Link2Off': 'LinkBreak',
    'Share': 'Share',
    'Reply': 'ArrowUUpLeft',
    'ReplyAll': 'ArrowUUpLeft',
    'Forward': 'ArrowUUpRight',
    'UploadCloud': 'CloudArrowUp',
    'DownloadCloud': 'CloudArrowDown',
    'History': 'ClockCounterClockwise',
    'Location': 'MapPin',
    'Locate': 'Crosshair',
    'PlaneTakeoff': 'AirplaneTilt',
    'PlaneLanding': 'AirplaneInFlight',
    'Bike': 'Bicycle',
    'Truck': 'Truck',
    'ShoppingCart': 'ShoppingCart',
    'Tags': 'Tags',
    'Sliders': 'SlidersHorizontal',
    'SlidersHorizontal': 'SlidersHorizontal',
    'Box': 'Package',
    'WifiOff': 'WifiSlash',
    'Bluetooth': 'Bluetooth',
    'Power': 'Power',
    'Flame': 'Fire',
    'Umbrella': 'Umbrella',
    'Square': 'Square',
    'Triangle': 'Triangle',
    'Hexagon': 'Hexagon',
    'Octagon': 'Octagon',
    'ArrowUpLeft': 'ArrowUpLeft',
    'ArrowUpRight': 'ArrowUpRight',
    'ArrowDownLeft': 'ArrowDownLeft',
    'ArrowDownRight': 'ArrowDownRight',
    'ChevronDownSquare': 'CaretDown',
    'Edit3': 'PencilSimple',
    'LifeBuoy': 'Lifebuoy',
    'Cross': 'Cross',
    'Ghost': 'Ghost',
    'Bot': 'Robot',
    'Crown': 'Crown',
    'Trophy': 'Trophy',
    'Leaf': 'Leaf',
    'Puzzle': 'PuzzlePiece',
    'Palette': 'Palette',
    'Layers': 'Stack',
    'ListTree': 'TreeStructure',
    'Wrench': 'Wrench',
    'Hammer': 'Hammer',
    'Tool': 'Wrench',
    'Anchor': 'Anchor',
    'GripVertical': 'DotsSixVertical',
    'GripHorizontal': 'DotsSix',
    'ArrowRightLeft': 'ArrowsLeftRight',
    'CheckSquare': 'CheckSquare',
};

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        try {
            filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return;
            }
            throw err;
        }
    });
    return filelist;
};

const files = walkSync(path.join('c:', 'Users', 'Utkarsh', 'OneDrive', 'Documents', 'Tripify', 'tripify', 'src')).filter(f => f.endsWith('.jsx') || f.endsWith('.tsx'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('lucide-react')) {
        let hasPhosphor = false;
        
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/g, (match, p1) => {
            const icons = p1.split(',').map(i => i.trim()).filter(i => i);
            const phosphorIcons = new Set();
            icons.forEach(i => {
                let cleanName = i;
                let alias = '';
                if (i.includes(' as ')) {
                    const parts = i.split(' as ');
                    cleanName = parts[0].trim();
                    alias = parts[1].trim();
                }
                const mapped = iconMapping[cleanName] || cleanName;
                if (alias) {
                    phosphorIcons.add(`${mapped} as ${alias}`);
                } else {
                    phosphorIcons.add(mapped);
                }
            });
            
            hasPhosphor = true;
            return `import { ${Array.from(phosphorIcons).join(', ')} } from '@phosphor-icons/react';`;
        });
        
        if (hasPhosphor) {
            Object.entries(iconMapping).forEach(([lucide, phosphor]) => {
                const tagRegex = new RegExp(`<${lucide}(\\s|>)`, 'g');
                content = content.replace(tagRegex, `<${phosphor}$1`);
                
                const objRegex = new RegExp(`icon:\\s*${lucide}\\b`, 'g');
                content = content.replace(objRegex, `icon: ${phosphor}`);
                
                const bracketRegex = new RegExp(`\\{${lucide}\\}`, 'g');
                content = content.replace(bracketRegex, `{${phosphor}}`);
            });
            
            // Background wrappers
            content = content.replace(/bg-(blue|indigo|emerald|purple|red|orange|yellow|green|teal|cyan|sky|fuchsia|pink|rose|gray|slate)-(50|100|200)/g, '');
            // Text colors -> standard dark
            content = content.replace(/text-(blue|indigo|emerald|purple|red|orange|yellow|green|teal|cyan|sky|fuchsia|pink|rose)-(400|500|600|700)/g, 'text-[#1A1A1A]');
            
            // Clean up empty classNames
            content = content.replace(/className=(['"])\s+/g, 'className=$1');
            content = content.replace(/\s+(['"])/g, '$1');
            content = content.replace(/className=['"]\s*['"]/g, '');
            
            fs.writeFileSync(file, content);
            console.log(`Updated ${file}`);
        }
    }
});
