const { createGlobPatternsForDependencies } = require('@nx/react/tailwind')
const { join } = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        join(
            __dirname,
            '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
        ),
        ...createGlobPatternsForDependencies(__dirname),
    ],
    theme: {
        extend: {
            colors: {
                dvcblue: '#1d49f4',
            },
        },
    },
    plugins: [],
}
