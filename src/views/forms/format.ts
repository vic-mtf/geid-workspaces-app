interface FormatItem {
    label: string;
    key: string;
    type?: string;
}

const format: Record<string, FormatItem> = {
    video: {
        label: 'filmothèque',
        key: 'film',
        type: 'media'
    },
    audio: {
        label: 'filmothèque',
        key: 'filmotheque',
        type: 'media'
    },
    document: {
        label: 'biblothèque',
        key: 'book',
    },
    image: {
        label: 'photothèque',
        key: 'image',
        type: 'media'
    }
};

export default format;
