## Environment Setup

Create a `.env.local` file in the project root (you can copy from `.env.example`).

Required variable:

```
NEXT_PUBLIC_API_BASE_URL=https://prompt-transformer-api.azurewebsites.net
```

`NEXT_PUBLIC_API_BASE_URL` must be prefixed with `NEXT_PUBLIC_` so it is exposed to the browser for the client-side hook `useGenerateJSON` which calls `${NEXT_PUBLIC_API_BASE_URL}/api/chat`.

If you deploy your own API, change the value accordingly (e.g. `https://your-domain.example.com`). Avoid a trailing slash; the code normalizes it.

After changing environment variables, restart the dev server.
