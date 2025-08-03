

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const MAX_FILES = 200;
const MAX_TOTAL_BYTES = 400 * 1024;

function scanFolderOutline(rootDir) {
  const outline = { root: rootDir, files: [] };
  let fileCount = 0;
  let byteCount = 0;

  (function recurse(current) {
    if (fileCount >= MAX_FILES || byteCount >= MAX_TOTAL_BYTES) return;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);

      if (entry.isDirectory()) {
        recurse(full);
      } else {
        if (fileCount >= MAX_FILES || byteCount >= MAX_TOTAL_BYTES) break;
        try {
          const buf = fs.readFileSync(full);
          byteCount += buf.length;
          fileCount += 1;
          const snippet = buf.toString('utf8').split(/\r?\n/).slice(0, 10).filter(Boolean).join('\n');
          outline.files.push({
            path: path.relative(rootDir, full),
            size: buf.length,
            snippet,
          });
        } catch { /* ignore */ }
      }
    }
  })(rootDir);

  return outline;
}

app.post('/generate-readme', async (req, res) => {
  const { folderPath } = req.body;
  if (!folderPath) {
    return res.status(400).send('folderPath is required');
  }

  let outlineTempFile;
  let tmpPromptFile;

  try {
    // 1. Scan the target folder and create the outline in the OS temp directory.
    const outline = scanFolderOutline(folderPath);
    outlineTempFile = path.join(os.tmpdir(), `outline-${Date.now()}.json`);
    fs.writeFileSync(outlineTempFile, JSON.stringify(outline, null, 2));

    // 2. Read the base prompt instructions.
    const promptPath = path.join(__dirname, 'src', 'prompts', 'readme-prompt.yaml');
    const promptYaml = fs.readFileSync(promptPath, 'utf8');
    const systemPrompt = promptYaml.split('content: |')[1].split('- role: user')[0].trim();
    const jsonOutline = fs.readFileSync(outlineTempFile, 'utf8');
    const fullPrompt = `${systemPrompt}\n\nHere is the codebase summary:\n\n${jsonOutline}`;
    
    // 3. Write the final, combined prompt to a temp file in the *target* folder.
    tmpPromptFile = path.join(folderPath, `prompt-${Date.now()}.txt`);
    fs.writeFileSync(tmpPromptFile, fullPrompt);

    // 4. The command uses the *relative path* to the temp prompt file.
    const command = `npx gemini -p "@${path.basename(tmpPromptFile)}" --model gemini-2.5-flash -y`;
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // 5. CRITICAL: The CWD is the folder the user dropped, not the app's root.
    const gem = spawn(command, { cwd: folderPath, shell: true });

    const cleanup = () => {
        if (outlineTempFile && fs.existsSync(outlineTempFile)) fs.unlinkSync(outlineTempFile);
        if (tmpPromptFile && fs.existsSync(tmpPromptFile)) fs.unlinkSync(tmpPromptFile);
    };

    gem.stdout.on('data', (data) => res.write(data));
    gem.stderr.on('data', (data) => res.write(`[GEMINI_STDERR] ${data}`));

    gem.on('close', (code) => {
      console.log(`Gemini process exited with code ${code}`);
      res.end();
      cleanup();
    });

    gem.on('error', (err) => {
        console.error('Failed to start Gemini process.', err);
        res.status(500).send('Failed to start Gemini process.');
        cleanup();
    });

  } catch (error) {
    console.error('Error during README generation:', error);
    res.status(500).send('Error during README generation.');
    if (outlineTempFile && fs.existsSync(outlineTempFile)) fs.unlinkSync(outlineTempFile);
    if (tmpPromptFile && fs.existsSync(tmpPromptFile)) fs.unlinkSync(tmpPromptFile);
  }
});

app.listen(port, () => {
  console.log(`Template server listening at http://localhost:${port}`);
});

