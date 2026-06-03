# CineVerse API Documentation

**Base URL:** `http://localhost:8080/api`  
**Version:** 1.0.0  
**Auth:** JWT Bearer Token (include in header as `Authorization: Bearer <token>`)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [TMDB — Movies & TV Shows](#3-tmdb--movies--tv-shows)
4. [Watchlist](#4-watchlist)
5. [Watched Content](#5-watched-content)
6. [Reviews & Ratings](#6-reviews--ratings)
7. [Community](#7-community)
8. [AI Chatbot](#8-ai-chatbot)
9. [Error Responses](#9-error-responses)

---

## 1. Authentication

> All auth endpoints are public (no token required).

---

### POST `/auth/register`

Register a new user account.

**Request Body**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| username | string | Yes | Non-blank |
| email | string | Yes | Valid email format |
| password | string | Yes | Min 6 characters |

**Response `200 OK`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Error `400`** — Email or username already taken.

---

### POST `/auth/login`

Login and receive a JWT token.

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200 OK`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Error `400`** — Invalid credentials.

---

## 2. User Management

> All endpoints require authentication.

---

### GET `/users/me`

Get the currently logged-in user's profile.

**Response `200 OK`**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "profileImageUrl": "https://res.cloudinary.com/...",
  "bio": "Movie enthusiast",
  "role": "USER",
  "createdAt": "2024-01-15T10:30:00"
}
```

---

### PUT `/users/me`

Update username and/or bio.

**Request Body**
```json
{
  "username": "new_username",
  "bio": "Updated bio text"
}
```

Both fields are optional. Omit any field to leave it unchanged.

**Response `200 OK`** — Returns updated `UserProfileDto` (same shape as GET `/users/me`).

**Error `400`** — Username already taken.

---

### POST `/users/me/profile-image`

Upload a profile picture. Stored on Cloudinary.

**Content-Type:** `multipart/form-data`

| Form Field | Type | Required |
|---|---|---|
| file | file (image) | Yes |

**Response `200 OK`** — Returns updated `UserProfileDto` with new `profileImageUrl`.

---

## 3. TMDB — Movies & TV Shows

> All GET endpoints are public (no token required).

---

### GET `/tmdb/trending/movies`

Fetch trending movies of the week.

**Response `200 OK`** — TMDB trending movies payload (proxied directly from TMDB).

---

### GET `/tmdb/trending/tv`

Fetch trending TV shows of the week.

**Response `200 OK`** — TMDB trending TV payload.

---

### GET `/tmdb/top-rated/movies`

Fetch top-rated movies.

**Response `200 OK`** — TMDB top-rated movies payload.

---

### GET `/tmdb/top-rated/tv`

Fetch top-rated TV shows.

**Response `200 OK`** — TMDB top-rated TV payload.

---

### GET `/tmdb/search/movies`

Search movies by title.

**Query Parameters**

| Param | Type | Required | Default |
|---|---|---|---|
| query | string | Yes | — |
| page | integer | No | 1 |

**Example:** `GET /api/tmdb/search/movies?query=inception&page=1`

**Response `200 OK`** — TMDB search results payload.

---

### GET `/tmdb/search/tv`

Search TV shows by title.

**Query Parameters**

| Param | Type | Required | Default |
|---|---|---|---|
| query | string | Yes | — |
| page | integer | No | 1 |

**Response `200 OK`** — TMDB search results payload.

---

### GET `/tmdb/movies/{id}`

Get full movie details including cast (via TMDB `append_to_response=credits`).

**Path Parameters**

| Param | Type | Description |
|---|---|---|
| id | Long | TMDB movie ID |

**Response `200 OK`** — TMDB movie detail + credits payload.

---

### GET `/tmdb/tv/{id}`

Get full TV show details including cast.

**Path Parameters**

| Param | Type | Description |
|---|---|---|
| id | Long | TMDB TV show ID |

**Response `200 OK`** — TMDB TV detail + credits payload.

---

### GET `/tmdb/movies/{id}/similar`

Get movies similar to a given movie.

**Response `200 OK`** — TMDB similar movies payload.

---

### GET `/tmdb/tv/{id}/similar`

Get TV shows similar to a given show.

**Response `200 OK`** — TMDB similar TV shows payload.

---

## 4. Watchlist

> All endpoints require authentication. Operates on the logged-in user's watchlist only.

---

### GET `/watchlist`

Get the user's full watchlist.

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "user": { "id": 1, "username": "john_doe" },
    "tmdbId": 550,
    "mediaType": "movie",
    "addedAt": "2024-01-15T12:00:00"
  }
]
```

---

### POST `/watchlist`

Add a movie or TV show to the watchlist.

**Request Body**
```json
{
  "tmdbId": 550,
  "mediaType": "movie"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| tmdbId | Long | Yes | TMDB content ID |
| mediaType | string | Yes | `"movie"` or `"tv"` |

**Response `200 OK`** — Returns the created `Watchlist` entry.

**Error `400`** — Already in watchlist.

---

### DELETE `/watchlist`

Remove an item from the watchlist.

**Request Body**
```json
{
  "tmdbId": 550,
  "mediaType": "movie"
}
```

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Removed from watchlist"
}
```

**Error `400`** — Item not found in watchlist.

---

## 5. Watched Content

> All endpoints require authentication.

> **Business Rule:** A user must mark content as watched before submitting a review or rating.

---

### GET `/watched`

Get the user's full watched content list.

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "user": { "id": 1, "username": "john_doe" },
    "tmdbId": 550,
    "mediaType": "movie",
    "watchedAt": "2024-01-15T20:00:00"
  }
]
```

---

### POST `/watched`

Mark a movie or TV show as watched.

**Request Body**
```json
{
  "tmdbId": 550,
  "mediaType": "movie"
}
```

**Response `200 OK`** — Returns the created `Watched` entry.

**Error `400`** — Already marked as watched.

---

### DELETE `/watched`

Remove an item from the watched list.

**Request Body**
```json
{
  "tmdbId": 550,
  "mediaType": "movie"
}
```

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Removed from watched"
}
```

**Error `400`** — Item not in watched list.

---

## 6. Reviews & Ratings

> All write endpoints require authentication.  
> GET endpoints are public.

> **Business Rule:** User must have the content in their watched list before submitting a review. Rating scale is 1–5 stars.

---

### POST `/reviews`

Add or update a review for a watched movie/show. If a review already exists for that content, it will be updated.

**Request Body**
```json
{
  "tmdbId": 550,
  "mediaType": "movie",
  "rating": 5,
  "reviewText": "One of the best movies ever made."
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| tmdbId | Long | Yes | TMDB content ID |
| mediaType | string | Yes | `"movie"` or `"tv"` |
| rating | integer | Yes | 1 to 5 |
| reviewText | string | No | Max 2000 characters |

**Response `200 OK`**
```json
{
  "id": 1,
  "userId": 1,
  "username": "john_doe",
  "tmdbId": 550,
  "mediaType": "movie",
  "rating": 5,
  "reviewText": "One of the best movies ever made.",
  "createdAt": "2024-01-15T21:00:00"
}
```

**Error `400`** — Content not in watched list.

---

### DELETE `/reviews/{id}`

Delete a review by ID. User can only delete their own reviews.

**Path Parameters**

| Param | Type | Description |
|---|---|---|
| id | Long | Review ID |

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Review deleted"
}
```

**Error `400`** — Review not found or not authorized.

---

### GET `/reviews/content`

Get all reviews for a specific movie or TV show.

**Query Parameters**

| Param | Type | Required |
|---|---|---|
| tmdbId | Long | Yes |
| mediaType | string | Yes |

**Example:** `GET /api/reviews/content?tmdbId=550&mediaType=movie`

**Response `200 OK`** — Array of `ReviewResponse` objects.

---

### GET `/reviews/me`

Get all reviews written by the logged-in user.

**Response `200 OK`** — Array of `ReviewResponse` objects.

---

## 7. Community

> GET endpoints for posts and comments are public.  
> Create, edit, delete, like, and comment require authentication.

---

### GET `/community/posts`

Get paginated list of all community posts, sorted newest first.

**Query Parameters**

| Param | Type | Required | Default |
|---|---|---|---|
| page | integer | No | 0 |
| size | integer | No | 10 |

**Response `200 OK`**
```json
{
  "content": [
    {
      "id": 1,
      "userId": 1,
      "username": "john_doe",
      "content": "Fight Club is a masterpiece!",
      "taggedTmdbId": 550,
      "taggedMediaType": "movie",
      "createdAt": "2024-01-15T22:00:00",
      "likeCount": 14,
      "commentCount": 3
    }
  ],
  "totalPages": 5,
  "totalElements": 47,
  "number": 0,
  "size": 10
}
```

---

### GET `/community/posts/{id}`

Get a single post by ID.

**Response `200 OK`** — Single `PostResponse` object.

**Error `400`** — Post not found.

---

### POST `/community/posts`

Create a new community post.

**Request Body**
```json
{
  "content": "Fight Club is a masterpiece!",
  "taggedTmdbId": 550,
  "taggedMediaType": "movie"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| content | string | Yes | Max 2000 characters |
| taggedTmdbId | Long | No | TMDB ID to tag |
| taggedMediaType | string | No | `"movie"` or `"tv"` |

**Response `200 OK`** — Returns created `PostResponse`.

---

### PUT `/community/posts/{id}`

Edit an existing post. Only the post author can edit.

**Request Body** — Same shape as POST.

**Response `200 OK`** — Returns updated `PostResponse`.

**Error `400`** — Post not found or not authorized.

---

### DELETE `/community/posts/{id}`

Delete a post. Author or Admin can delete.

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Post deleted"
}
```

---

### POST `/community/posts/{id}/like`

Toggle like on a post (like if not liked, unlike if already liked).

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Liked"
}
```
or
```json
{
  "success": true,
  "message": "Unliked"
}
```

---

### GET `/community/posts/{id}/comments`

Get all comments on a post.

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "postId": 1,
    "userId": 2,
    "username": "jane_smith",
    "commentText": "Totally agree!",
    "createdAt": "2024-01-15T22:30:00"
  }
]
```

---

### POST `/community/posts/{id}/comments`

Add a comment to a post.

**Request Body**
```json
{
  "commentText": "Totally agree!"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| commentText | string | Yes | Max 1000 characters |

**Response `200 OK`** — Returns created `CommentResponse`.

---

### DELETE `/community/comments/{id}`

Delete a comment by ID. Comment author or Admin can delete.

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Comment deleted"
}
```

---

## 8. AI Chatbot

> Requires authentication. Uses the user's watch history, watchlist, and ratings as context for personalized recommendations.

---

### POST `/chat`

Send a message to the CineVerse AI recommendation chatbot.

**Request Body**
```json
{
  "message": "Recommend me a thriller similar to Inception"
}
```

| Field | Type | Required |
|---|---|---|
| message | string | Yes |

**Response `200 OK`**
```json
{
  "reply": "Based on your love of Inception, you'd likely enjoy Interstellar (2014) for its mind-bending narrative, Shutter Island (2010) for psychological thrills, and Tenet (2020) for another Nolan time-manipulation experience. All three have similar pacing and cerebral storytelling..."
}
```

The chatbot has access to:
- User's watched content list
- User's ratings
- User's watchlist

---

## 9. Error Responses

All errors follow a consistent format.

**Validation Error `400`**
```json
{
  "errors": [
    "email: must be a well-formed email address",
    "password: size must be between 6 and 2147483647"
  ]
}
```

**Business / Runtime Error `400`**
```json
{
  "error": "You must watch this content before reviewing"
}
```

**Unauthorized `401`** — No token or invalid/expired token. Spring Security returns this automatically.

**Internal Server Error `500`**
```json
{
  "error": "Internal server error"
}
```

---

## Quick Reference — All Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register |
| POST | `/auth/login` | Public | Login |
| GET | `/users/me` | Required | Get profile |
| PUT | `/users/me` | Required | Update profile |
| POST | `/users/me/profile-image` | Required | Upload profile image |
| GET | `/tmdb/trending/movies` | Public | Trending movies |
| GET | `/tmdb/trending/tv` | Public | Trending TV shows |
| GET | `/tmdb/top-rated/movies` | Public | Top rated movies |
| GET | `/tmdb/top-rated/tv` | Public | Top rated TV shows |
| GET | `/tmdb/search/movies` | Public | Search movies |
| GET | `/tmdb/search/tv` | Public | Search TV shows |
| GET | `/tmdb/movies/{id}` | Public | Movie details + cast |
| GET | `/tmdb/tv/{id}` | Public | TV show details + cast |
| GET | `/tmdb/movies/{id}/similar` | Public | Similar movies |
| GET | `/tmdb/tv/{id}/similar` | Public | Similar TV shows |
| GET | `/watchlist` | Required | Get watchlist |
| POST | `/watchlist` | Required | Add to watchlist |
| DELETE | `/watchlist` | Required | Remove from watchlist |
| GET | `/watched` | Required | Get watched list |
| POST | `/watched` | Required | Mark as watched |
| DELETE | `/watched` | Required | Remove from watched |
| POST | `/reviews` | Required | Add or update review |
| DELETE | `/reviews/{id}` | Required | Delete review |
| GET | `/reviews/content` | Public | Reviews for content |
| GET | `/reviews/me` | Required | My reviews |
| GET | `/community/posts` | Public | All posts (paginated) |
| GET | `/community/posts/{id}` | Public | Single post |
| POST | `/community/posts` | Required | Create post |
| PUT | `/community/posts/{id}` | Required | Edit post |
| DELETE | `/community/posts/{id}` | Required | Delete post |
| POST | `/community/posts/{id}/like` | Required | Toggle like |
| GET | `/community/posts/{id}/comments` | Public | Get comments |
| POST | `/community/posts/{id}/comments` | Required | Add comment |
| DELETE | `/community/comments/{id}` | Required | Delete comment |
| POST | `/chat` | Required | AI chatbot |
