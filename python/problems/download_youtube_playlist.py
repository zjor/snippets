import pytube
from pytube import YouTube
import os
import subprocess

URL = "https://music.youtube.com/watch?v=oRpxXT7Z5Io&list=PLQ-wQ4D9LuuebhZNaT_G7WiInjW9Cm3UX"


def remove_double_underscore(value: str) -> str:
    new_value = value.replace('__', '_')
    while new_value != value:
        value = new_value
        new_value = value.replace('__', '_')
    return value


def get_filename(video: YouTube) -> str:
    author = remove_double_underscore(video.author.lower().replace(' ', '_').replace('-', '_'))
    title = remove_double_underscore(video.title.lower().replace(' ', '_').replace('-', '_'))
    return f"{author}__{title}"


def convert_to_mp3(filename: str) -> None:
    subprocess.run(['ffmpeg', '-i', f'./downloads/{filename}.webm', f'./downloads/{filename}.mp3'])


def main():
    p = pytube.Playlist(URL)
    for video in p.videos:
        try:
            filename = get_filename(video)
            if os.path.exists(f"./downloads/{filename}.webm"):
                print(f"{filename} exists, skipping...")
                continue
            print(f"=== Downloading '{filename}' from {video.watch_url} ===")
            video.streams.filter(only_audio=True).get_by_itag(251).download(
                output_path='./downloads',
                filename=f"{filename}.webm")
            convert_to_mp3(filename)
        except:
            print("Failed to download or convert, skipping")


if __name__ == "__main__":
    main()
