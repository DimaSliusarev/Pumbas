"use strict";

require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs").promises;

const { recommendFolder } = require("./recommender");

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(express.static(__dirname));

const MUSIC_DIRECTORY = path.join(__dirname, "usa-1");

const SUPPORTED_EXTENSIONS = new Set([
    ".mp3",
    ".wav",
    ".m4a",
    ".aac",
    ".ogg",
    ".flac",
    ".mp4"
]);

async function scanMusicDirectory(directory = MUSIC_DIRECTORY){

    const entries = await fs.readdir(directory,{withFileTypes:true});

    let tracks=[];

    for(const entry of entries){

        const fullPath=path.join(directory,entry.name);

        if(entry.isDirectory()){

            tracks.push(...await scanMusicDirectory(fullPath));
            continue;
        }

        const ext=path.extname(entry.name).toLowerCase();

        if(!SUPPORTED_EXTENSIONS.has(ext))
            continue;

        const relative=path.relative(MUSIC_DIRECTORY,fullPath);

        tracks.push({

            title:path.basename(entry.name,ext),

            group:path.dirname(relative).replace(/\\/g,"/"),

            url:"./usa-1/"+relative.replace(/\\/g,"/")

        });

    }

    return tracks.sort((a,b)=>{

        if(a.group===b.group)
            return a.title.localeCompare(b.title);

        return a.group.localeCompare(b.group);

    });

}

app.get("/api/tracks",async(req,res)=>{

    try{

        const tracks=await scanMusicDirectory();

        res.json({tracks});

    }

    catch(err){

        console.error(err);

        res.status(500).json({

            error:"Could not load tracks"

        });

    }

});

app.post("/api/recommend",async(req,res)=>{

    try{

        console.log("Received:",req.body);

        const folder=await recommendFolder(

            req.body.area,

            req.body.activity

        );

        console.log("Folder:", folder);

        res.json({

            folder

        });

    }

    catch(err){

        console.error(err);

        res.status(500).json({

            error:"Recommendation failed"

        });

    }

});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "musicplayer.html"));
});

app.listen(PORT,()=>{

    console.log(`Server running at http://localhost:${PORT}`);

});