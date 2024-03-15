export default function getFileExtension (fileName = null) {
    return (
        fileName ? 
        String(fileName)
        .slice(String(fileName)
        .lastIndexOf('.') + 1, String(fileName).length)
        .trim() : null
    )
};

export const getName = (fileName = null) => (
    fileName ? 
    String(fileName)
    .slice(0, String(fileName)
    .lastIndexOf('.'))
    .trim() : null
    );
    