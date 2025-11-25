/**
 * file-organize-full.js
 *
 * - Ensures messy-files and organized-files exist.
 * - If messy-files is empty, creates sample files.
 * - Copies a provided uploaded file into messy-files if present.
 * - Recursively scans messy-files and moves files into categorized folders under organized-files.
 *
 * Note: This script moves files by default. If you prefer copy-only behavior, set MOVE_FILES = false.
 */

const fs = require('fs');
const path = require('path');

const MOVE_FILES = true; // set to false to copy files instead of move
const BASE_DIR = __dirname;

// Paths used by the script
const sourceDir = path.join(BASE_DIR, 'messy-files');
const organizedDir = path.join(BASE_DIR, 'organized-files');

// Uploaded file path from your session (provided by you / upload)
const UPLOADED_FILE_PATH = '/mnt/data/figma.fig'; // <- using the uploaded file path from your session

const categories = {
  images: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'],
  videos: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'webm'],
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'],
  audio: ['mp3', 'wav', 'aac', 'flac', 'wma', 'ogg', 'm4a'],
  archives: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso'],
  executables: ['exe', 'msi', 'dmg', 'app', 'bin', 'sh', 'bat'],
  fonts: ['ttf', 'otf', 'woff', 'woff2'],
  others: ['*']
};

function getCategory(ext) {
  if (!ext) return 'others';
  ext = ext.toLowerCase();
  for (const cat of Object.keys(categories)) {
    if (categories[cat].includes(ext)) return cat;
  }
  return 'others';
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** Append -1, -2, ... to avoid collisions */
function uniqueDestPath(destDir, filename) {
  const parsed = path.parse(filename);
  let base = parsed.name;
  const ext = parsed.ext; // includes leading '.'
  let target = path.join(destDir, filename);
  let counter = 0;
  while (fs.existsSync(target)) {
    counter++;
    const newName = `${base}-${counter}${ext}`;
    target = path.join(destDir, newName);
  }
  return target;
}

/** Recursively walk directory and move files into categories */
function walkAndOrganize(currentDir) {
  const items = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const item of items) {
    // skip hidden files/folders (optional)
    if (item.name.startsWith('.')) continue;

    const fullPath = path.join(currentDir, item.name);

    if (item.isDirectory()) {
      // recurse into subfolder
      walkAndOrganize(fullPath);

      // remove the folder if it became empty
      try {
        const remaining = fs.readdirSync(fullPath);
        if (remaining.length === 0) {
          fs.rmdirSync(fullPath);
        }
      } catch (e) {
        // ignore
      }
    } else if (item.isFile()) {
      const ext = item.name.includes('.') ? item.name.split('.').pop() : '';
      const category = getCategory(ext);

      const destCategoryDir = path.join(organizedDir, category);
      ensureDir(destCategoryDir);

      const destPath = uniqueDestPath(destCategoryDir, item.name);

      try {
        if (MOVE_FILES) {
          fs.renameSync(fullPath, destPath);
          console.log(`Moved: ${fullPath} -> ${path.relative(BASE_DIR, destPath)}`);
        } else {
          fs.copyFileSync(fullPath, destPath);
          console.log(`Copied: ${fullPath} -> ${path.relative(BASE_DIR, destPath)}`);
        }
      } catch (err) {
        // handle cross-device rename errors by copy+unlink
        if (err.code === 'EXDEV' || err.code === 'EPERM') {
          fs.copyFileSync(fullPath, destPath);
          fs.unlinkSync(fullPath);
          console.log(`Copied+Removed: ${fullPath} -> ${path.relative(BASE_DIR, destPath)}`);
        } else {
          console.error(`Failed to move ${fullPath}:`, err.message);
        }
      }
    }
  }
}

/** Create some sample files in sourceDir if it's empty */
function createSampleFiles() {
  const sampleNames = [
    'sample-image.jpg',
    'sample-video.mp4',
    'sample-audio.mp3',
    'sample-document.pdf',
    'sample-archive.zip',
    'notes.txt'
  ];

  sampleNames.forEach((name) => {
    const p = path.join(sourceDir, name);
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, `This is a sample file: ${name}\nCreated at ${new Date().toISOString()}`);
    }
  });

  console.log('Sample files created in', sourceDir);
}

/** If the uploaded file exists in the known upload path, copy it into sourceDir */
function copyUploadedFileIfExists() {
  try {
    if (fs.existsSync(UPLOADED_FILE_PATH)) {
      const filename = path.basename(UPLOADED_FILE_PATH);
      const dest = path.join(sourceDir, filename);
      // if dest exists, skip or make unique
      const finalDest = uniqueDestPath(sourceDir, filename);
      fs.copyFileSync(UPLOADED_FILE_PATH, finalDest);
      console.log(`Copied uploaded file into source: ${UPLOADED_FILE_PATH} -> ${finalDest}`);
      // Also print the "url" (local path) — your toolchain can convert it later
      console.log('Uploaded file path (use as URL):', UPLOADED_FILE_PATH);
    } else {
      // console.log('Uploaded file not found at', UPLOADED_FILE_PATH);
    }
  } catch (err) {
    console.error('Error copying uploaded file:', err.message);
  }
}

/** Main */
function organize() {
  // Ensure base dirs
  ensureDir(sourceDir);
  ensureDir(organizedDir);

  // Create category folders
  Object.keys(categories).forEach((cat) => ensureDir(path.join(organizedDir, cat)));

  // If sourceDir is empty, create sample files and copy the uploaded file (if present)
  const srcItems = fs.readdirSync(sourceDir);
  if (srcItems.length === 0) {
    console.log('Source directory is empty — creating sample files.');
    createSampleFiles();
    copyUploadedFileIfExists();
  } else {
    // If not empty, still try to copy the uploaded file (only if not already present)
    copyUploadedFileIfExists();
  }

  // Now organize recursively
  console.log('Organizing files from', sourceDir, 'into', organizedDir);
  walkAndOrganize(sourceDir);
  console.log('Done.');
}

organize();
