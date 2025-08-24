# Favicon Setup Instructions

## To add your Jumanji logo as favicon:

1. **Prepare your logo file:**
   - Convert your Jumanji logo to `.ico` format
   - Recommended sizes: 16x16, 32x32, or 48x48 pixels
   - Save it as `favicon.ico`

2. **Place the file:**
   - Put your `favicon.ico` file in this `/public` directory
   - The file should be at: `/public/favicon.ico`

3. **Verify the setup:**
   - The layout.tsx file is already configured to use `/favicon.ico`
   - Next.js will automatically serve it from the public directory
   - Your logo will appear in browser tabs once you add the file

## File structure should look like:
```
public/
├── favicon.ico          ← Your Jumanji logo here
├── FAVICON_INSTRUCTIONS.md
└── index.html
```

## Browser compatibility:
- `.ico` format works in all browsers
- For better mobile support, you can also add:
  - `favicon-16x16.png` (16x16 pixels)
  - `favicon-32x32.png` (32x32 pixels)
  - `apple-touch-icon.png` (180x180 pixels for iOS)

Your Jumanji logo will automatically appear in browser tabs once you replace this instructions file with your actual favicon.ico!
