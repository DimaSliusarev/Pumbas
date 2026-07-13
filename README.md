# Pumbas

## Run the music player locally

The music player scans the `musicplayer/usa-1` folder and builds its track menu whenever the page loads.

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

### Start the player

1. Open a terminal in the root `Pumbas` project folder.
2. Move into the music player folder:

   ```bash
   cd musicplayer
   ```

3. Start the local server:

   ```bash
   npm start
   ```

   The project has no third-party packages, so an `npm install` step is not required.

4. Open the following address in a browser:

   ```text
   http://localhost:8080
   ```

5. Choose a song from the dropdown menu. Tracks are grouped using their folder names.

Keep the terminal open while using the player. To stop the server, return to the terminal and press `Control+C`.

### Add music

1. Add a media file anywhere inside `musicplayer/usa-1`.
2. Use subfolders to control how tracks are grouped in the dropdown. For example:

   ```text
   musicplayer/usa-1/Exercise/Running/My Song.mp3
   ```

3. Reload the browser page. The server scans the folder again and includes the new track automatically.

Supported file extensions are:

- `.mp3`
- `.m4a`
- `.aac`
- `.ogg`
- `.wav`
- `.flac`
- `.mp4`

Actual playback support can vary by browser and by the codec used inside a file.

### Use a different port

Port `8080` is used by default. If it is already occupied, start the player on another port:

```bash
PORT=3000 npm start
```

Then open `http://localhost:3000`.

### Troubleshooting

#### The page says that the music library is unavailable

Do not open `musicplayer.html` directly or serve it with an unrelated static-file extension. The `/api/tracks` endpoint is provided by `server.js`, so start the project with `npm start` and use the printed localhost address.

#### A new song does not appear

- Confirm that the file is inside `musicplayer/usa-1`.
- Confirm that its extension is in the supported list above.
- Reload the page after adding the file.
- Check the terminal for a folder-scanning error.

#### A track appears but does not play

- Try opening another track to confirm the player is working.
- Check that the media file is not damaged.
- Try MP3 format, which has the broadest browser support.

#### The server reports that the port is already in use

Stop the other process using port `8080`, or follow the instructions above to use a different port.

## Security note

Never place ChatGPT/OpenAI API keys or other secrets in HTML or browser-side JavaScript, and do not commit them to the repository.
