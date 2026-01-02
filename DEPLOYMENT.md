# Deployment and Security Configuration Guide

## Environment Variables Setup

This application uses environment variables to protect sensitive data. Before deploying, you need to configure the following:

### 1. NextAuth Configuration

```bash
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret

```bash
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

### 3. Allowed Users

Configure which email addresses can access the application:

```bash
ALLOWED_EMAILS=user1@example.com,user2@example.com
```

### 4. User Data

Configure default user data (using NEXT_PUBLIC_ prefix makes them available on the client side):

```bash
NEXT_PUBLIC_USER_APELIDO=Pereira
NEXT_PUBLIC_USER_PRIMEIRO_NOME=Diogo
NEXT_PUBLIC_USER_NUM_COLABORADOR=10059580
NEXT_PUBLIC_USER_DIRECAO=AIC
NEXT_PUBLIC_USER_CENTRO_CUSTO=001-3751
NEXT_PUBLIC_USER_BI_CC=15469466
NEXT_PUBLIC_USER_NIF=233530509
NEXT_PUBLIC_USER_CONTACTO=936439706
```

## Deploying to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add all environment variables listed above in the Vercel project settings
4. Deploy!

## Deploying to Other Cloud Providers

For other providers (Netlify, AWS, Azure, etc.), make sure to:
1. Set all environment variables in the provider's dashboard
2. Configure the OAuth redirect URLs in Google Cloud Console
3. Update NEXTAUTH_URL to match your production domain

## Security Notes

- **Never commit** `.env.local` or `.env` files to Git
- Store environment variables securely in your deployment platform
- Rotate `NEXTAUTH_SECRET` periodically
- Use the `ALLOWED_EMAILS` feature to restrict access to authorized users only
- The `NEXT_PUBLIC_` prefix exposes variables to the client side - only use for non-sensitive data

## Development Setup

1. Copy `.env.example` to `.env.local`
2. Fill in the required values
3. Run `npm install`
4. Run `npm run dev`

## Testing Authentication Locally

If you want to test Google OAuth locally:
1. Set up Google OAuth credentials as described above
2. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
3. Configure `.env.local` with your OAuth credentials
4. Run the development server
