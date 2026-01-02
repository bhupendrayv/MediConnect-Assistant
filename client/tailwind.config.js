/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#10b981', // Medical Emerald Green
                secondary: '#00D09C', // Medical Green
            }
        },
    },
    darkMode: 'class',
    plugins: [],
}
