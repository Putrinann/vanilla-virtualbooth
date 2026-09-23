# Vanilla Booth

Vanilla Booth is a web-based virtual photobooth that allows users to capture photos using their camera, upload photos from their device, select their favorite shots, decorate them with custom frames and stickers, and export the final result.

This project was created as a lightweight and playful digital photobooth experience that can run directly in the browser without requiring additional software.

## Background

Traditional photobooths are usually tied to physical booths, instant printers, and limited frame templates. While they are fun, they are not always accessible for users who simply want to create quick, personalized, and visually expressive photo results from their own device.

The initial idea behind Vanilla Booth was to bring the photobooth experience into a web application. The goal was to keep the fun and expressive feeling of a physical photobooth while making it more flexible. Users can take photos with their webcam, upload existing photos, choose layouts, apply themed frames, add stickers, adjust photo positioning, and save the final result.

## Project Goals

- Build a digital photobooth that can be used directly from the browser.
- Create a simple flow from capturing photos to decorating and exporting.
- Provide visual customization through frames, filters, colors, and stickers.
- Allow users to save the final result as a PNG image.
- Deliver a playful, responsive, and easy-to-use interface.

## Main Features

- Capture photos directly using a webcam.
- Upload photos manually from the device.
- Timer options: no timer, 3 seconds, 5 seconds, and 10 seconds.
- Select up to 8 photos for the final frame.
- Multiple layout options, including Polaroid 2R, strip 3, strip 4, grid 6, and grid 8.
- Frame templates such as Classic Polaroid, Birthday Edition, Newspaper, Retro Film, Bubble Light, Aurora, Paper, Wood, Lace, Cake Pop, Dark Pop, Candy Shop, and Dream Cloud.
- Light and dark frame modes.
- Photo filters, including Original, Grayscale, Sepia, and Vintage.
- Decorative stickers that can be added and dragged around the frame.
- Photo positioning and scaling controls.
- Custom frame and background color options.
- Export final design as a PNG image.
- Export a short animated WebM video.
- Print the final frame directly from the browser.

## Tech Stack

- **React** for building the user interface and managing application state.
- **Vite** as the development server and build tool.
- **Tailwind CSS** for utility-first styling.
- **Custom CSS** for frame visuals, templates, layouts, and decorative effects.
- **react-webcam** for browser camera access.
- **html2canvas** for converting the final frame into an image.
- **framer-motion** as an animation dependency.
- **lucide-react** for interface icons.

## Application Flow

1. **Capture**
   Users can turn on the camera, choose a timer, take photos, or upload images from their device. Captured photos can be selected, retaken, and prepared for the decoration step.

2. **Decorate**
   Users can choose a layout, frame template, color mode, filter, stickers, and adjust photo positioning inside the frame. This step is the main customization stage.

3. **Export**
   Once the frame is ready, users can download the final result as a PNG image, print it, or generate a short WebM animation.

## Development Process

The development process started by defining the main user flow: how users move from taking photos to receiving a final exported result. After the core flow was clear, the implementation was divided into three main stages:

1. **Building the capture flow**
   The first stage focused on webcam integration, photo upload, timer behavior, photo preview, retake functionality, and photo selection.

2. **Building the decoration system**
   After photos could be collected and selected, the project moved into the frame preview system. This included layout options, frame templates, filters, color customization, stickers, and photo crop adjustment.

3. **Building the export flow**
   The final stage focused on turning the browser-based visual result into a downloadable file. `html2canvas` is used to render the frame component into a PNG image. A simple WebM export feature was also added using canvas and `MediaRecorder`.

Overall, the project followed a flow-first approach. The main user journey was planned first, then features were built progressively based on each step of the experience. After the core functionality worked, the visual styling and template variations were expanded to give the application a stronger identity.

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
|-- vite.config.js
`-- src
    |-- App.jsx
    |-- main.jsx
    `-- styles.css
```

## Getting Started

Make sure Node.js is installed, then run:

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Development Notes

This application uses browser camera access, so users need to grant camera permission when prompted. For the best experience, use a modern browser such as Chrome, Edge, or the latest version of Safari.

## Future Improvements

- Add custom text and font options inside the frame.
- Add drag-resize controls for stickers.
- Add saved favorite templates.
- Add more specific print-size export options.
- Add direct sharing support for social media.

## Author

Created by **putrinann**.
