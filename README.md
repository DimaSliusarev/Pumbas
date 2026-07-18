# Pumbas

## Music player

The music player scans `musicplayer/usa-1`, groups tracks by folder, and exposes the playlist through `/api/tracks`.

- During local development, `server.js` provides the API and streams the media.
- On Netlify, a serverless function provides the same API while Netlify serves the media as static files.
- During every Netlify build, `build.js` regenerates the playlist from the current contents of `usa-1`.

### Requirements

- Node.js 18 or newer
- npm, which is included with Node.js
- A modern web browser

Check that Node.js and npm are installed:

```bash
node --version
npm --version
```

If either command is unavailable, install Node.js from [nodejs.org](https://nodejs.org/) and reopen the terminal.

## Run locally

1. Open a terminal in the root `Pumbas` project folder.
2. Move into the music player folder:

   ```bash
   cd musicplayer
   ```

3. Start the local server:

   ```bash
   npm start
   ```

   The project has no third-party runtime packages, so an `npm install` step is not required.

4. Open the following address:

   ```text
   http://localhost:8080
   ```

5. Choose a song from the dropdown menu.

Keep the terminal open while using the player. Press `Control+C` in the terminal to stop it.

### Use a different local port

Port `8080` is used by default. If it is occupied, run:

```bash
PORT=3000 npm start
```

Then open `http://localhost:3000`.

## Create a Netlify production build

From the `musicplayer` folder, run:

```bash
npm run build
```

This command:

1. Scans all supported media in `usa-1`.
2. Generates the playlist used by the Netlify Function.
3. Creates `musicplayer/dist` with `index.html`, the CSS, browser JavaScript, and media files.

The `dist` directory is generated and ignored by Git. Netlify creates it again during each deployment.

## Deploy to Netlify

The root `netlify.toml` already contains the required build, publish-directory, and Functions settings.

1. Commit and push the complete `Pumbas` repository to GitHub, GitLab, Bitbucket, or Azure DevOps.
2. Sign in to Netlify.
3. Select **Add new project**, then **Import an existing project**.
4. Connect the Git provider and select the `Pumbas` repository.
5. Netlify should read these settings from `netlify.toml`:

   ```text
   Base directory: musicplayer
   Build command: npm run build
   Publish directory: musicplayer/dist
   Functions directory: musicplayer/netlify/functions
   ```

6. Select **Deploy**.

After deployment, the music player is served from the Netlify site URL and its playlist is returned by the serverless `/api/tracks` endpoint.

Do not configure `npm start` as the Netlify build command. `server.js` is only for local development and is not run in production.

## Add music

1. Add a media file anywhere inside `musicplayer/usa-1`.
2. Use subfolders to control its dropdown group. For example:

   ```text
   musicplayer/usa-1/Exercise/Running/My Song.mp3
   ```

3. For local development, reload the page.
4. For Netlify, commit and push the new file. Netlify rebuilds the site and regenerates the serverless playlist automatically.

Supported extensions are:

- `.mp3`
- `.m4a`
- `.aac`
- `.ogg`
- `.wav`
- `.flac`
- `.mp4`

Actual playback support can vary by browser and by the codec used inside a file.

## Troubleshooting

### The local page says the music library is unavailable

Do not open `musicplayer.html` directly. Start the project with `npm start` from the `musicplayer` folder and use the printed localhost address.

### A new track does not appear locally

- Confirm that the file is inside `musicplayer/usa-1`.
- Confirm that its extension is supported.
- Reload the page.
- Check the terminal for a folder-scanning error.

### A new track does not appear on Netlify

- Confirm that the media file was committed and pushed.
- Check that Netlify ran a new deployment for the commit.
- Open the Netlify deploy log and confirm that the build reports the expected track count.
- Confirm that `netlify.toml` was detected at the repository root.

### A track appears but does not play

- Check that the media file is not damaged.
- Try MP3 format, which has broad browser support.
- Confirm that the file appears in the Netlify deploy file browser under `usa-1`.

### The local port is already in use

Stop the other process using port `8080`, or use a different port as described above.

## Security and copyright

Never place ChatGPT/OpenAI API keys or other secrets in HTML or browser-side JavaScript, and do not commit them to the repository. Only publish music that you have permission to distribute publicly.
