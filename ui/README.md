# Music Recommendation App UI

This is the frontend UI for the Music Recommendation App built with Next.js.

## Features

- User login/registration
- Browse all songs and recommendations
- Search songs
- Like/unlike songs
- View liked songs
- Responsive design

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```


## API Integration

The UI connects to the FastAPI backend that provides the following endpoints:

- `/login` - User login/registration
- `/songs` - Get all songs
- `/search` - Search for songs
- `/liked` - Get user's liked songs
- `/like/{song_id}` - Like a song
- `/unlike/{song_id}` - Unlike a song
- `/recommended` - Get recommended songs

## Technology Stack

- Next.js
- React
- TypeScript
- CSS-in-JS