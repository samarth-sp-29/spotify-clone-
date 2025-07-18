import os
import json

songs_folder = "songs"
songs = []

for filename in os.listdir(songs_folder):
    if filename.endswith(".mp3"):
        songs.append(filename)

with open("songs.json", "w") as f:
    json.dump(songs, f, indent=4)

print(" songs.json has been updated with", len(songs), "songs.")