# Platform Spec Notes

Checked on: 2026-06-22

## Suno Rights

Official Suno help states that songs made while subscribed to Pro or Premier are granted commercial use rights, while retroactive commercial rights for free-plan songs are not guaranteed.

Sources:

- https://help.suno.com/en/categories/550145-rights-ownership
- https://help.suno.com/en/articles/9601665
- https://help.suno.com/en/articles/2425729

Packet implication:

Frank should confirm this song was created while subscribed before distributor upload or monetized external use.

## Spotify Canvas

Spotify for Artists describes Canvas as a short vertical loop for a track. Spotify's upload troubleshooting currently lists:

- 3-8 seconds
- 9:16 vertical ratio
- 720-1080 px tall
- MP4 or JPG

Sources:

- https://support.spotify.com/us/artists/article/adding-a-canvas/
- https://support.spotify.com/us/artists/article/fix-spotify-canvas-upload-error/

Packet implication:

`assets/motion/oh-chama-spotify-canvas-loop-6s-1080x1920.mp4` matches the timing, vertical aspect, codec, and height guidance.

## Spotify Music Videos

Spotify currently describes music video delivery through a label/distributor or direct Spotify for Artists upload for limited beta access.

Sources:

- https://support.spotify.com/us/artists/article/music-videos/
- https://artists.spotify.com/en/music-videos

Packet implication:

Do not assume automated Spotify music-video upload. Use Canvas now; plan a full official video only after distribution/channel access is clear.

## YouTube Shorts

Google's current Shorts help covers three-minute Shorts and music-use limits. This packet uses a 24 second vertical original-audio promo clip, staying well inside current short-form duration norms.

Sources:

- https://support.google.com/youtube/answer/15424877
- https://www.youtube.com/intl/en_us/creators/create/shorts

Packet implication:

The primary Shorts file is suitable as a short-form upload candidate, subject to final rights and human-listen checks.

