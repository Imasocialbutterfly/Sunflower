const imageFiles = import.meta.glob(
    '../media/**/*.{jpg,jpeg,png,webp,gif,avif}',
    { eager: true, query: '?url', import: 'default' }
)

const videoFiles = import.meta.glob(
    '../media/**/*.{mp4,webm,mov,m4v}',
    { eager: true, query: '?url', import: 'default' }
)

const DEFAULT_IMAGE_DURATION = 2500 // 2.5s per photo

const baseName = (path) => {
    const file = path.split('/').pop() ?? ''
    return file.replace(/\.[^.]+$/, '')
}

const buildEntry = (path, url, type) => ({
    type,
    src: url,
    name: baseName(path),
    duration: type === 'image' ? DEFAULT_IMAGE_DURATION : undefined,
})

const byName = (a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })

const images = Object.entries(imageFiles)
    .map(([path, url]) => buildEntry(path, url, 'image'))

const videos = Object.entries(videoFiles)
    .map(([path, url]) => buildEntry(path, url, 'video'))

export const media = [...images, ...videos].sort(byName)
export const isDemo = false