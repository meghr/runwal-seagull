# Cloudinary Setup Guide ☁️

Follow these steps to configure image and document uploads for the Runwal Seagull portal.

## Step 1: Get Cloud Name
1. Log in to your [Cloudinary Console](https://console.cloudinary.com/).
2. On the **Dashboard** (main page), look for **Product Environment Credentials**.
3. Copy the **Cloud Name**.
4. Paste it into your `.env.local` file:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
   ```

## Step 2: Create Upload Preset
1. Go to **Settings** (gear icon) -> **Upload**.
2. Scroll down to **Upload presets**.
3. Click **Add upload preset**.
4. Configure the following:
   - **Name**: `runwal_seagull_preset`
   - **Signing Mode**: Select **Unsigned** (Important!)
5. Click **Save**.

## Step 3: Update Environment File
Ensure your `.env.local` file has the preset variable (if you used the default name above, this is optional, but good practice):

```env
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="runwal_seagull_preset"
```

## Step 4: Verify
- Restart your development server (`npm run dev`) to load the new environment variables.
- The upload widget should now work on the frontend.
